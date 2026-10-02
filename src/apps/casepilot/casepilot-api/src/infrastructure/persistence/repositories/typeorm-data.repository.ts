import type { EntityManager } from 'typeorm';
import type { PageRequest } from '@casepilot/abstractions';
import type { DataRepository } from '../../../domain/repositories/data.repository.js';
import type { StoredEntity } from '../../../domain/entities/stored-entity.js';
import type { SqlTable } from '../sql-table.js';
import { sqlRows } from '../sql-values.js';
import { normalizeSqlError } from '../sql-error.js';

export abstract class TypeOrmDataRepository<TEntity extends StoredEntity> implements DataRepository<TEntity> {
  constructor(private readonly manager: EntityManager, private readonly table: SqlTable<TEntity>) {}

  private quote(identifier: string): string { return this.manager.connection.driver.escape(identifier); }
  private tableName(): string {
    const options = this.manager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    return this.quote(options.schema ?? 'public') + '.' + this.quote(this.table.tableName);
  }
  private projection(): string {
    return this.table.columns.map(column => this.quote(column.name) + ' AS ' + this.quote(column.property)).join(', ');
  }
  private scope(tenant: string | null, position: number): string {
    if (this.table.tenant && tenant === null) throw new Error('A tenant scope is required.');
    if (!this.table.tenant && tenant !== null) throw new Error('A global scope is required.');
    return this.table.tenant ? 'business_account_id = $' + position : 'TRUE';
  }
  private async rows(sql: string, parameters: unknown[]): Promise<Record<string, unknown>[]> {
    try { return sqlRows(await this.manager.query<unknown>(sql, parameters)); }
    catch (error: unknown) { throw normalizeSqlError(error); }
  }

  async getById(id: string, businessAccountId: string | null): Promise<TEntity | null> {
    const row = (await this.rows('SELECT ' + this.projection() + ' FROM ' + this.tableName() + ' WHERE id = $1 AND ' + this.scope(businessAccountId, 2), this.table.tenant ? [id, businessAccountId] : [id]))[0];
    return row ? this.table.read(row) : null;
  }
  async getPage(page: PageRequest, businessAccountId: string | null): Promise<readonly TEntity[]> {
    const sort = this.table.columns.find(column => column.property === (page.sortBy ?? 'id'));
    if (!sort || (page.sortDirection !== 'asc' && page.sortDirection !== 'desc')) throw new Error('Unsupported sorting.');
    const where = this.scope(businessAccountId, 3);
    const order = this.quote(sort.name) + ' ' + page.sortDirection.toUpperCase() + (sort.name === 'id' ? '' : ', id ASC');
    const rows = await this.rows('SELECT ' + this.projection() + ' FROM ' + this.tableName() + ' WHERE ' + where + ' ORDER BY ' + order + ' LIMIT $1 OFFSET $2', this.table.tenant ? [page.pageSize, page.offset, businessAccountId] : [page.pageSize, page.offset]);
    return rows.map(row => this.table.read(row));
  }
  async count(businessAccountId: string | null): Promise<number> {
    const row = (await this.rows('SELECT count(*)::text AS total FROM ' + this.tableName() + ' WHERE ' + this.scope(businessAccountId, 1), this.table.tenant ? [businessAccountId] : []))[0];
    const count = Number(row?.total);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid count.');
    return count;
  }
  async add(entity: TEntity): Promise<TEntity> {
    const values = this.table.columns.map(column => {
      const value = column.value(entity);
      return column.json && value !== null ? JSON.stringify(value) : value;
    });
    const row = (await this.rows('INSERT INTO ' + this.tableName() + ' (' + this.table.columns.map(column => this.quote(column.name)).join(', ') + ') VALUES (' + values.map((_, index) => '$' + (index + 1)).join(', ') + ') RETURNING ' + this.projection(), values))[0];
    if (!row) throw new Error('Insert did not return a row.');
    return this.table.read(row);
  }
  async update(entity: TEntity, businessAccountId: string | null, expectedVersion: number): Promise<TEntity | null> {
    const columns = this.table.columns.filter(column => !['id', 'created_at', 'business_account_id'].includes(column.name));
    const values = columns.map(column => {
      const value = column.value(entity);
      return column.json && value !== null ? JSON.stringify(value) : value;
    });
    const idPosition = values.length + 1, versionPosition = values.length + 2, tenantPosition = values.length + 3;
    const where = 'id = $' + idPosition + ' AND version = $' + versionPosition + ' AND ' + this.scope(businessAccountId, tenantPosition);
    const row = (await this.rows('UPDATE ' + this.tableName() + ' SET ' + columns.map((column, index) => this.quote(column.name) + ' = $' + (index + 1)).join(', ') + ' WHERE ' + where + ' RETURNING ' + this.projection(), [...values, entity.id, expectedVersion, ...(this.table.tenant ? [businessAccountId] : [])]))[0];
    return row ? this.table.read(row) : null;
  }
  async delete(id: string, businessAccountId: string | null, expectedVersion: number): Promise<boolean> {
    const rows = await this.rows('DELETE FROM ' + this.tableName() + ' WHERE id = $1 AND version = $2 AND ' + this.scope(businessAccountId, 3) + ' RETURNING id', this.table.tenant ? [id, expectedVersion, businessAccountId] : [id, expectedVersion]);
    return rows.length === 1;
  }
}
