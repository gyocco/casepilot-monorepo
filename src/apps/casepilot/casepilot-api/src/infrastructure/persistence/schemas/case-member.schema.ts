import { EntitySchema } from 'typeorm';
import { CaseMember } from '../../../domain/entities/case-member.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const case_memberSchema = new EntitySchema<CaseMember>({
  name: 'CaseMember', target: CaseMember, tableName: 'case_members',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: false },
    memberId: { name: 'member_id', type: 'uuid', nullable: false },
    role: { name: 'role', type: 'varchar', nullable: true, length: 255 },
    isPrimary: { name: 'is_primary', type: 'boolean', nullable: false },
    assignedAt: { name: 'assigned_at', type: 'timestamptz', nullable: false },
    removedAt: { name: 'removed_at', type: 'timestamptz', nullable: true },
  },
  uniques: [
    { name: 'uq_case_members_0', columns: ["businessAccountId","id"] },
    { name: 'uq_case_members_1', columns: ["caseId","memberId"] },
  ],
  indices: [
    { name: 'idx_case_members_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_case_members_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_case_members_2', columns: ["businessAccountId","memberId"] },
  ],
  foreignKeys: [
    { name: 'fk_case_members_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_case_members_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_case_members_member_id', target: 'Member', columnNames: ["businessAccountId","memberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const case_memberTable: SqlTable<CaseMember> = {
  schema: case_memberSchema, tableName: 'case_members', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'memberId', name: 'member_id', value: entity => entity.memberId },
    { property: 'role', name: 'role', value: entity => entity.role },
    { property: 'isPrimary', name: 'is_primary', value: entity => entity.isPrimary },
    { property: 'assignedAt', name: 'assigned_at', value: entity => entity.assignedAt },
    { property: 'removedAt', name: 'removed_at', value: entity => entity.removedAt },
  ],
  read: row => {
    const entity = new CaseMember();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = sqlString(row.caseId);
    entity.memberId = sqlString(row.memberId);
    entity.role = row.role === null ? null : sqlString(row.role);
    entity.isPrimary = sqlBoolean(row.isPrimary);
    entity.assignedAt = sqlTimestamp(row.assignedAt);
    entity.removedAt = row.removedAt === null ? null : sqlTimestamp(row.removedAt);
    return entity;
  },
};
