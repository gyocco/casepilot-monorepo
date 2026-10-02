import type { EntityManager } from 'typeorm';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import { ReferenceRecord } from '../../../domain/entities/reference-record.js';
import type { ResourceKind } from '../../../domain/entities/resource-kind.js';
import { referenceTables } from '../reference-tables.js';
import { sqlRows, sqlString } from '../sql-values.js';
import { normalizeSqlError } from '../sql-error.js';
export class TypeOrmReferenceRepository implements ReferenceRepository {
  constructor(private readonly manager: EntityManager) {}
  async find(kind: ResourceKind, id: string, businessAccountId: string | null): Promise<ReferenceRecord | null> {
    const table = referenceTables[kind];
    const options = this.manager.connection.options;
    if (options.type !== 'postgres' || (table.tenant && businessAccountId === null)) throw new Error('Invalid reference scope.');
    const quote = (value: string): string => this.manager.connection.driver.escape(value);
    const selection = ['id', table.tenant ? 'business_account_id AS tenant' : 'NULL AS tenant', table.caseColumn ? quote(table.caseColumn) + ' AS case_id' : 'NULL AS case_id', table.parentColumn ? quote(table.parentColumn) + ' AS parent_id' : 'NULL AS parent_id'].join(', ');
    const name = quote(options.schema ?? 'public') + '.' + quote(table.name);
    const sql = 'SELECT ' + selection + ' FROM ' + name + ' WHERE id = $1' + (table.tenant ? ' AND business_account_id = $2' : '');
    try {
      const row = sqlRows(await this.manager.query<unknown>(sql, table.tenant ? [id, businessAccountId] : [id]))[0];
      return row ? new ReferenceRecord(sqlString(row.id), row.tenant === null ? null : sqlString(row.tenant), row.case_id === null ? null : sqlString(row.case_id), row.parent_id === null ? null : sqlString(row.parent_id)) : null;
    } catch (error: unknown) { throw normalizeSqlError(error); }
  }
}
