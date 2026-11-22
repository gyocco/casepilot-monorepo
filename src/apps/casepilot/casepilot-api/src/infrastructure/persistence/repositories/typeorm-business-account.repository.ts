import type { EntityManager } from 'typeorm';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { BusinessAccountRepository } from '../../../domain/repositories/business-account.repository.js';
import { business_accountTable } from '../schemas/business-account.schema.js';
import { TypeOrmDataRepository, normalizeSqlError, sqlRows } from '@casepilot/persistence/typeorm';

export class TypeOrmBusinessAccountRepository extends TypeOrmDataRepository<BusinessAccount> implements BusinessAccountRepository {
  constructor(private readonly entityManager: EntityManager) {
    super(entityManager, business_accountTable);
  }

  async listByIds(ids: readonly string[]): Promise<readonly BusinessAccount[]> {
    if (ids.length === 0) return [];
    const options = this.entityManager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    const quote = (identifier: string): string => this.entityManager.connection.driver.escape(identifier);
    const projection = business_accountTable.columns.map(column => `${quote(column.name)} AS ${quote(column.property)}`).join(', ');
    const tableName = `${quote(options.schema ?? 'public')}.${quote(business_accountTable.tableName)}`;
    try {
      const rows = sqlRows(await this.entityManager.query<unknown>(
        `SELECT ${projection} FROM ${tableName} WHERE ${quote('id')} = ANY($1::uuid[]) ORDER BY ${quote('created_at')} ASC, ${quote('id')} ASC`,
        [[...ids]],
      ));
      return rows.map(row => business_accountTable.read(row));
    } catch (error: unknown) {
      throw normalizeSqlError(error);
    }
  }
}
