import type { EntityManager } from 'typeorm';
import type { PageRequest, ScopedDataRepository, StoredEntity } from '@casepilot/abstractions';
import type { SqlTable } from './sql-table.js';
import { sqlRows } from './sql-values.js';
import { normalizeSqlError } from './sql-error.js';

/** One parameterized SQL statement per operation; no transactions or product policy. */
export abstract class TypeOrmDataRepository<TEntity extends StoredEntity> implements ScopedDataRepository<TEntity> {
  declare readonly entityType?: TEntity;
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
  private scope(scopeId: string | null, position: number): string {
    if (this.table.scopeColumn !== null && scopeId === null) throw new Error('A persistence scope is required.');
    if (this.table.scopeColumn === null && scopeId !== null) throw new Error('A global scope is required.');
    return this.table.scopeColumn === null ? 'TRUE' : this.quote(this.table.scopeColumn) + ' = $' + position;
  }
  private async rows(sql: string, parameters: unknown[]): Promise<Record<string, unknown>[]> {
    try { return sqlRows(await this.manager.query<unknown>(sql, parameters)); }
    catch (error: unknown) { throw normalizeSqlError(error); }
  }
  async getById(id: string, scopeId: string | null): Promise<TEntity | null> {
    const where = this.quote(this.table.idColumn) + ' = $1 AND ' + this.scope(scopeId, 2);
    const row = (await this.rows('SELECT ' + this.projection() + ' FROM ' + this.tableName() + ' WHERE ' + where, this.table.scopeColumn === null ? [id] : [id, scopeId]))[0];
    return row ? this.table.read(row) : null;
  }
  async getPage(page: PageRequest, scopeId: string | null): Promise<readonly TEntity[]> {
    const sort = this.table.columns.find(column => column.property === (page.sortBy ?? 'id'));
    if (!sort || (page.sortDirection !== 'asc' && page.sortDirection !== 'desc')) throw new Error('Unsupported sorting.');
    const where = this.scope(scopeId, 3);
    const order = this.quote(sort.name) + ' ' + page.sortDirection.toUpperCase() + (sort.name === this.table.idColumn ? '' : ', ' + this.quote(this.table.idColumn) + ' ASC');
    const rows = await this.rows('SELECT ' + this.projection() + ' FROM ' + this.tableName() + ' WHERE ' + where + ' ORDER BY ' + order + ' LIMIT $1 OFFSET $2', this.table.scopeColumn === null ? [page.pageSize, page.offset] : [page.pageSize, page.offset, scopeId]);
    return rows.map(row => this.table.read(row));
  }
  async count(scopeId: string | null): Promise<number> {
    const row = (await this.rows('SELECT count(*)::text AS total FROM ' + this.tableName() + ' WHERE ' + this.scope(scopeId, 1), this.table.scopeColumn === null ? [] : [scopeId]))[0];
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
  async update(entity: TEntity, scopeId: string | null, expectedVersion: number): Promise<TEntity | null> {
    const columns = this.table.columns.filter(column => !this.table.immutableColumns.includes(column.name));
    const values = columns.map(column => {
      const value = column.value(entity);
      return column.json && value !== null ? JSON.stringify(value) : value;
    });
    const idPosition = values.length + 1, versionPosition = values.length + 2, scopePosition = values.length + 3;
    const where = this.quote(this.table.idColumn) + ' = $' + idPosition + ' AND ' + this.quote(this.table.versionColumn) + ' = $' + versionPosition + ' AND ' + this.scope(scopeId, scopePosition);
    const row = (await this.rows('UPDATE ' + this.tableName() + ' SET ' + columns.map((column, index) => this.quote(column.name) + ' = $' + (index + 1)).join(', ') + ' WHERE ' + where + ' RETURNING ' + this.projection(), [...values, entity.id, expectedVersion, ...(this.table.scopeColumn === null ? [] : [scopeId])]))[0];
    return row ? this.table.read(row) : null;
  }
  async delete(id: string, scopeId: string | null, expectedVersion: number): Promise<boolean> {
    const where = this.quote(this.table.idColumn) + ' = $1 AND ' + this.quote(this.table.versionColumn) + ' = $2 AND ' + this.scope(scopeId, 3);
    const rows = await this.rows('DELETE FROM ' + this.tableName() + ' WHERE ' + where + ' RETURNING ' + this.quote(this.table.idColumn), this.table.scopeColumn === null ? [id, expectedVersion] : [id, expectedVersion, scopeId]);
    return rows.length === 1;
  }
}
