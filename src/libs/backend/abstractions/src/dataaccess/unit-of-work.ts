import type { Repository } from './repository.js';

export type TransactionIsolation = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
export type RepositoryScope<TRepositories> = { readonly [K in keyof TRepositories]: Repository };

/** Application supplies the callback and uses only its transaction-bound repositories. */
export interface UnitOfWork<TRepositories extends RepositoryScope<TRepositories>> {
  execute<TResult>(work: (repositories: TRepositories) => Promise<TResult>, isolation?: TransactionIsolation): Promise<TResult>;
}
