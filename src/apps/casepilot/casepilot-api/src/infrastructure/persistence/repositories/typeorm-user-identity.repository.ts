import type { EntityManager } from 'typeorm';
import { TypeOrmDataRepository, normalizeSqlError, sqlRows } from '@casepilot/persistence/typeorm';
import type { UserIdentity } from '../../../domain/entities/user-identity.js';
import type { UserIdentityRepository } from '../../../domain/repositories/user-identity.repository.js';
import { userIdentityTable } from '../schemas/user-identity.schema.js';

export class TypeOrmUserIdentityRepository extends TypeOrmDataRepository<UserIdentity> implements UserIdentityRepository {
  constructor(private readonly entityManager: EntityManager) {
    super(entityManager, userIdentityTable);
  }

  async getByProviderSubject(provider: string, subject: string): Promise<UserIdentity | null> {
    const options = this.entityManager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    const quote = (identifier: string): string => this.entityManager.connection.driver.escape(identifier);
    const projection = userIdentityTable.columns.map(column => `${quote(column.name)} AS ${quote(column.property)}`).join(', ');
    const tableName = `${quote(options.schema ?? 'public')}.${quote(userIdentityTable.tableName)}`;
    try {
      const row = sqlRows(await this.entityManager.query<unknown>(
        `SELECT ${projection} FROM ${tableName} WHERE ${quote('provider')} = $1 AND ${quote('subject')} = $2 LIMIT 1`,
        [provider, subject],
      ))[0];
      return row ? userIdentityTable.read(row) : null;
    } catch (error: unknown) {
      throw normalizeSqlError(error);
    }
  }
}
