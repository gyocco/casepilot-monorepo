import type { DataSource, EntityManager } from 'typeorm';
import type { RepositoryScope, TransactionIsolation, UnitOfWork } from '../unit-of-work.js';
import { UnitOfWorkError } from '../unit-of-work-error.js';

/** Bind NEW repository instances to this manager; never reuse global repositories. */
export class TypeOrmUnitOfWork<TRepositories extends RepositoryScope<TRepositories>> implements UnitOfWork<TRepositories> {
  constructor(
    private readonly getSource: () => Promise<DataSource>,
    private readonly createRepositories: (manager: EntityManager) => TRepositories,
  ) {}

  async execute<TResult>(work: (repositories: TRepositories) => Promise<TResult>, isolation?: TransactionIsolation): Promise<TResult> {
    let callbackFailed = false;
    let callbackError: unknown;
    try {
      const source = await this.getSource();
      const run = async (manager: EntityManager): Promise<TResult> => {
        const repositories = this.createRepositories(manager);
        try { return await work(repositories); }
        catch (error: unknown) { callbackFailed = true; callbackError = error; throw error; }
      };
      // TypeORM awaits callback AND commit, rolls back failures, and releases the runner in finally.
      return await (isolation ? source.transaction(isolation, run) : source.transaction(run));
    } catch (error: unknown) {
      // Application/repository errors retain their contract; driver lifecycle errors are sanitized.
      if (callbackFailed && error === callbackError) throw error;
      throw new UnitOfWorkError();
    }
  }
}
