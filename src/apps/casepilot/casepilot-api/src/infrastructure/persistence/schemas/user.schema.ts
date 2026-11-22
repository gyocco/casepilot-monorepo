import { EntitySchema } from 'typeorm';
import { User } from '../../../domain/entities/user.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/persistence/typeorm';
export const userSchema = new EntitySchema<User>({
  name: 'User', target: User, tableName: 'users',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    email: { name: 'email', type: 'varchar', nullable: false, length: 255 },
    emailVerifiedAt: { name: 'email_verified_at', type: 'timestamptz', nullable: true },
    firstName: { name: 'first_name', type: 'varchar', nullable: false, length: 255 },
    lastName: { name: 'last_name', type: 'varchar', nullable: false, length: 255 },
    displayName: { name: 'display_name', type: 'varchar', nullable: true, length: 255 },
    avatarUrl: { name: 'avatar_url', type: 'varchar', nullable: true, length: 255 },
    locale: { name: 'locale', type: 'varchar', nullable: true, length: 255 },
    timezone: { name: 'timezone', type: 'varchar', nullable: true, length: 255 },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    lastLoginAt: { name: 'last_login_at', type: 'timestamptz', nullable: true },
  },
  uniques: [
    { name: 'uq_users_0', columns: ["email"] },
  ],
  indices: [
    { name: 'idx_users_0', columns: ["createdAt","id"] },
  ],
  foreignKeys: [

  ],
});
export const userTable: SqlTable<User> = {
  schema: userSchema, tableName: 'users', scopeColumn: null,
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'email', name: 'email', value: entity => entity.email },
    { property: 'emailVerifiedAt', name: 'email_verified_at', value: entity => entity.emailVerifiedAt },
    { property: 'firstName', name: 'first_name', value: entity => entity.firstName },
    { property: 'lastName', name: 'last_name', value: entity => entity.lastName },
    { property: 'displayName', name: 'display_name', value: entity => entity.displayName },
    { property: 'avatarUrl', name: 'avatar_url', value: entity => entity.avatarUrl },
    { property: 'locale', name: 'locale', value: entity => entity.locale },
    { property: 'timezone', name: 'timezone', value: entity => entity.timezone },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'lastLoginAt', name: 'last_login_at', value: entity => entity.lastLoginAt },
  ],
  read: row => {
    const entity = new User();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.email = sqlString(row.email);
    entity.emailVerifiedAt = row.emailVerifiedAt === null ? null : sqlTimestamp(row.emailVerifiedAt);
    entity.firstName = sqlString(row.firstName);
    entity.lastName = sqlString(row.lastName);
    entity.displayName = row.displayName === null ? null : sqlString(row.displayName);
    entity.avatarUrl = row.avatarUrl === null ? null : sqlString(row.avatarUrl);
    entity.locale = row.locale === null ? null : sqlString(row.locale);
    entity.timezone = row.timezone === null ? null : sqlString(row.timezone);
    entity.status = sqlString(row.status);
    entity.lastLoginAt = row.lastLoginAt === null ? null : sqlTimestamp(row.lastLoginAt);
    return entity;
  },
};
