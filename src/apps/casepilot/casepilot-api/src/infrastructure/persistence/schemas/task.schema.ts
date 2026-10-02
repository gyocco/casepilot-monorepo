import { EntitySchema } from 'typeorm';
import { Task } from '../../../domain/entities/task.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger } from '../sql-values.js';
export const taskSchema = new EntitySchema<Task>({
  name: 'Task', target: Task, tableName: 'tasks',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    title: { name: 'title', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    priority: { name: 'priority', type: 'varchar', nullable: true, length: 255 },
    assignedMemberId: { name: 'assigned_member_id', type: 'uuid', nullable: true },
    createdByMemberId: { name: 'created_by_member_id', type: 'uuid', nullable: false },
    dueAt: { name: 'due_at', type: 'timestamptz', nullable: true },
    completedAt: { name: 'completed_at', type: 'timestamptz', nullable: true },
  },
  uniques: [
    { name: 'uq_tasks_0', columns: ["businessAccountId","id"] },
    { name: 'uq_tasks_1', columns: ["businessAccountId","id","caseId"] },
  ],
  indices: [
    { name: 'idx_tasks_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_tasks_1', columns: ["businessAccountId","assignedMemberId","status"] },
    { name: 'idx_tasks_2', columns: ["caseId","status"] },
    { name: 'idx_tasks_3', columns: ["dueAt"] },
    { name: 'idx_tasks_4', columns: ["businessAccountId","caseId"] },
    { name: 'idx_tasks_5', columns: ["businessAccountId","assignedMemberId"] },
    { name: 'idx_tasks_6', columns: ["businessAccountId","createdByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_tasks_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_tasks_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_tasks_assigned_member_id', target: 'Member', columnNames: ["businessAccountId","assignedMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_tasks_created_by_member_id', target: 'Member', columnNames: ["businessAccountId","createdByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const taskTable: SqlTable<Task> = {
  schema: taskSchema, tableName: 'tasks', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'priority', name: 'priority', value: entity => entity.priority },
    { property: 'assignedMemberId', name: 'assigned_member_id', value: entity => entity.assignedMemberId },
    { property: 'createdByMemberId', name: 'created_by_member_id', value: entity => entity.createdByMemberId },
    { property: 'dueAt', name: 'due_at', value: entity => entity.dueAt },
    { property: 'completedAt', name: 'completed_at', value: entity => entity.completedAt },
  ],
  read: row => {
    const entity = new Task();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.title = sqlString(row.title);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.status = sqlString(row.status);
    entity.priority = row.priority === null ? null : sqlString(row.priority);
    entity.assignedMemberId = row.assignedMemberId === null ? null : sqlString(row.assignedMemberId);
    entity.createdByMemberId = sqlString(row.createdByMemberId);
    entity.dueAt = row.dueAt === null ? null : sqlTimestamp(row.dueAt);
    entity.completedAt = row.completedAt === null ? null : sqlTimestamp(row.completedAt);
    return entity;
  },
};
