import { EntitySchema } from 'typeorm';
import { Deadline } from '../../../domain/entities/deadline.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice } from '../sql-values.js';
export const deadlineSchema = new EntitySchema<Deadline>({
  name: 'Deadline', target: Deadline, tableName: 'deadlines',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: false },
    title: { name: 'title', type: 'varchar', nullable: false, length: 255 },
    dueAt: { name: 'due_at', type: 'timestamptz', nullable: false },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    responsibleMemberId: { name: 'responsible_member_id', type: 'uuid', nullable: true },
    completedAt: { name: 'completed_at', type: 'timestamptz', nullable: true },
    notes: { name: 'notes', type: 'text', nullable: true },
  },
  uniques: [
    { name: 'uq_deadlines_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_deadlines_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_deadlines_1', columns: ["businessAccountId","dueAt","status"] },
    { name: 'idx_deadlines_2', columns: ["businessAccountId","caseId"] },
    { name: 'idx_deadlines_3', columns: ["businessAccountId","responsibleMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_deadlines_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_deadlines_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_deadlines_responsible_member_id', target: 'Member', columnNames: ["businessAccountId","responsibleMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const deadlineTable: SqlTable<Deadline> = {
  schema: deadlineSchema, tableName: 'deadlines', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'dueAt', name: 'due_at', value: entity => entity.dueAt },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'responsibleMemberId', name: 'responsible_member_id', value: entity => entity.responsibleMemberId },
    { property: 'completedAt', name: 'completed_at', value: entity => entity.completedAt },
    { property: 'notes', name: 'notes', value: entity => entity.notes },
  ],
  read: row => {
    const entity = new Deadline();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = sqlString(row.caseId);
    entity.title = sqlString(row.title);
    entity.dueAt = sqlTimestamp(row.dueAt);
    entity.status = sqlChoice(row.status, ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED'] as const);
    entity.responsibleMemberId = row.responsibleMemberId === null ? null : sqlString(row.responsibleMemberId);
    entity.completedAt = row.completedAt === null ? null : sqlTimestamp(row.completedAt);
    entity.notes = row.notes === null ? null : sqlString(row.notes);
    return entity;
  },
};
