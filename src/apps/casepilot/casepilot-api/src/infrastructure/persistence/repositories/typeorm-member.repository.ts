import type { EntityManager } from 'typeorm';
import type { Member } from '../../../domain/entities/member.js';
import type { MemberRepository } from '../../../domain/repositories/member.repository.js';
import { memberTable } from '../schemas/member.schema.js';
import { TypeOrmDataRepository, normalizeSqlError, sqlRows } from '@casepilot/persistence/typeorm';

export class TypeOrmMemberRepository extends TypeOrmDataRepository<Member> implements MemberRepository {
  constructor(private readonly entityManager: EntityManager) {
    super(entityManager, memberTable);
  }

  async getByUserAndAccount(userId: string, businessAccountId: string): Promise<Member | null> {
    const options = this.entityManager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    const quote = (identifier: string): string => this.entityManager.connection.driver.escape(identifier);
    const projection = memberTable.columns.map(column => `${quote(column.name)} AS ${quote(column.property)}`).join(', ');
    const tableName = `${quote(options.schema ?? 'public')}.${quote(memberTable.tableName)}`;
    try {
      const row = sqlRows(await this.entityManager.query<unknown>(
        `SELECT ${projection} FROM ${tableName} WHERE ${quote('user_id')} = $1 AND ${quote('business_account_id')} = $2 LIMIT 1`,
        [userId, businessAccountId],
      ))[0];
      return row ? memberTable.read(row) : null;
    } catch (error: unknown) {
      throw normalizeSqlError(error);
    }
  }

  async listByUser(userId: string): Promise<readonly Member[]> {
    const options = this.entityManager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    const quote = (identifier: string): string => this.entityManager.connection.driver.escape(identifier);
    const projection = memberTable.columns.map(column => `${quote(column.name)} AS ${quote(column.property)}`).join(', ');
    const tableName = `${quote(options.schema ?? 'public')}.${quote(memberTable.tableName)}`;
    try {
      const rows = sqlRows(await this.entityManager.query<unknown>(
        `SELECT ${projection} FROM ${tableName} WHERE ${quote('user_id')} = $1 ORDER BY ${quote('created_at')} ASC, ${quote('id')} ASC`,
        [userId],
      ));
      return rows.map(row => memberTable.read(row));
    } catch (error: unknown) {
      throw normalizeSqlError(error);
    }
  }
}
