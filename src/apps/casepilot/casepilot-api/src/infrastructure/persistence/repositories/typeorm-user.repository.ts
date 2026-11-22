import type { EntityManager } from 'typeorm';
import type { User } from '../../../domain/entities/user.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import { userTable } from '../schemas/user.schema.js';
import { TypeOrmDataRepository, normalizeSqlError, sqlRows } from '@casepilot/persistence/typeorm';

export class TypeOrmUserRepository extends TypeOrmDataRepository<User> implements UserRepository {
  constructor(private readonly entityManager: EntityManager) {
    super(entityManager, userTable);
  }

  async getByEmail(email: string): Promise<User | null> {
    const options = this.entityManager.connection.options;
    if (options.type !== 'postgres') throw new Error('PostgreSQL is required.');
    const quote = (identifier: string): string => this.entityManager.connection.driver.escape(identifier);
    const projection = userTable.columns.map(column => `${quote(column.name)} AS ${quote(column.property)}`).join(', ');
    const tableName = `${quote(options.schema ?? 'public')}.${quote(userTable.tableName)}`;
    try {
      const row = sqlRows(await this.entityManager.query<unknown>(
        `SELECT ${projection} FROM ${tableName} WHERE LOWER(${quote('email')}) = LOWER($1) LIMIT 1`,
        [email],
      ))[0];
      return row ? userTable.read(row) : null;
    } catch (error: unknown) {
      throw normalizeSqlError(error);
    }
  }
}
