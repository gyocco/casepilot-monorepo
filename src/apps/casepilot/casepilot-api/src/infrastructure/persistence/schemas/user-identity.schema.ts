import { EntitySchema } from 'typeorm';
import { UserIdentity } from '../../../domain/entities/user-identity.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlInteger, sqlString, sqlTimestamp } from '@casepilot/persistence/typeorm';

export const userIdentitySchema = new EntitySchema<UserIdentity>({
  name: 'UserIdentity',
  target: UserIdentity,
  tableName: 'user_identities',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    userId: { name: 'user_id', type: 'uuid', nullable: false },
    provider: { name: 'provider', type: 'varchar', nullable: false, length: 64 },
    subject: { name: 'subject', type: 'varchar', nullable: false, length: 255 },
  },
  uniques: [
    { name: 'uq_user_identities_provider_subject', columns: ['provider', 'subject'] },
  ],
  indices: [
    { name: 'idx_user_identities_user_id', columns: ['userId'] },
  ],
  foreignKeys: [
    { name: 'fk_user_identities_user_id', target: 'User', columnNames: ['userId'], referencedColumnNames: ['id'], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});

export const userIdentityTable: SqlTable<UserIdentity> = {
  schema: userIdentitySchema,
  tableName: 'user_identities',
  scopeColumn: null,
  idColumn: 'id',
  versionColumn: 'version',
  immutableColumns: ['id', 'created_at', 'provider', 'subject'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'userId', name: 'user_id', value: entity => entity.userId },
    { property: 'provider', name: 'provider', value: entity => entity.provider },
    { property: 'subject', name: 'subject', value: entity => entity.subject },
  ],
  read: row => {
    const entity = new UserIdentity();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.userId = sqlString(row.userId);
    entity.provider = sqlString(row.provider);
    entity.subject = sqlString(row.subject);
    return entity;
  },
};
