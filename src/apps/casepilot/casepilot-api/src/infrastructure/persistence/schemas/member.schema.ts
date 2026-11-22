import { EntitySchema } from 'typeorm';
import { Member } from '../../../domain/entities/member.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice } from '@casepilot/persistence/typeorm';
export const memberSchema = new EntitySchema<Member>({
  name: 'Member', target: Member, tableName: 'members',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    userId: { name: 'user_id', type: 'uuid', nullable: false },
    role: { name: 'role', type: 'varchar', nullable: false, length: 255 },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    title: { name: 'title', type: 'varchar', nullable: true, length: 255 },
    professionalRegistration: { name: 'professional_registration', type: 'varchar', nullable: true, length: 255 },
    hourlyRate: { name: 'hourly_rate', type: 'numeric', nullable: true, precision: 20, scale: 4 },
    joinedAt: { name: 'joined_at', type: 'timestamptz', nullable: true },
    invitedAt: { name: 'invited_at', type: 'timestamptz', nullable: true },
  },
  uniques: [
    { name: 'uq_members_0', columns: ["businessAccountId","id"] },
    { name: 'uq_members_1', columns: ["businessAccountId","userId"] },
  ],
  indices: [
    { name: 'idx_members_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_members_1', columns: ["businessAccountId","userId"] },
  ],
  foreignKeys: [
    { name: 'fk_members_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_members_user_id', target: 'User', columnNames: ["userId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const memberTable: SqlTable<Member> = {
  schema: memberSchema, tableName: 'members', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'userId', name: 'user_id', value: entity => entity.userId },
    { property: 'role', name: 'role', value: entity => entity.role },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'professionalRegistration', name: 'professional_registration', value: entity => entity.professionalRegistration },
    { property: 'hourlyRate', name: 'hourly_rate', value: entity => entity.hourlyRate },
    { property: 'joinedAt', name: 'joined_at', value: entity => entity.joinedAt },
    { property: 'invitedAt', name: 'invited_at', value: entity => entity.invitedAt },
  ],
  read: row => {
    const entity = new Member();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.userId = sqlString(row.userId);
    entity.role = sqlString(row.role);
    entity.status = sqlChoice(row.status, ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'] as const);
    entity.title = row.title === null ? null : sqlString(row.title);
    entity.professionalRegistration = row.professionalRegistration === null ? null : sqlString(row.professionalRegistration);
    entity.hourlyRate = row.hourlyRate === null ? null : sqlString(row.hourlyRate);
    entity.joinedAt = row.joinedAt === null ? null : sqlTimestamp(row.joinedAt);
    entity.invitedAt = row.invitedAt === null ? null : sqlTimestamp(row.invitedAt);
    return entity;
  },
};
