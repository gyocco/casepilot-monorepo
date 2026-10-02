import { EntitySchema } from 'typeorm';
import { TimeEntry } from '../../../domain/entities/time-entry.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '../sql-values.js';
export const time_entrySchema = new EntitySchema<TimeEntry>({
  name: 'TimeEntry', target: TimeEntry, tableName: 'time_entries',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: false },
    memberId: { name: 'member_id', type: 'uuid', nullable: false },
    taskId: { name: 'task_id', type: 'uuid', nullable: true },
    description: { name: 'description', type: 'text', nullable: true },
    startedAt: { name: 'started_at', type: 'timestamptz', nullable: true },
    endedAt: { name: 'ended_at', type: 'timestamptz', nullable: true },
    durationMinutes: { name: 'duration_minutes', type: 'integer', nullable: false },
    billable: { name: 'billable', type: 'boolean', nullable: false },
    hourlyRate: { name: 'hourly_rate', type: 'numeric', nullable: true, precision: 20, scale: 4 },
    currency: { name: 'currency', type: 'varchar', nullable: true, length: 255 },
    invoiceLineId: { name: 'invoice_line_id', type: 'uuid', nullable: true },
  },
  uniques: [
    { name: 'uq_time_entries_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_time_entries_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_time_entries_1', columns: ["caseId","memberId"] },
    { name: 'idx_time_entries_2', columns: ["businessAccountId","caseId"] },
    { name: 'idx_time_entries_3', columns: ["businessAccountId","memberId"] },
    { name: 'idx_time_entries_4', columns: ["businessAccountId","taskId"] },
    { name: 'idx_time_entries_5', columns: ["businessAccountId","invoiceLineId"] },
  ],
  foreignKeys: [
    { name: 'fk_time_entries_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_time_entries_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_time_entries_member_id', target: 'Member', columnNames: ["businessAccountId","memberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_time_entries_task_id', target: 'Task', columnNames: ["businessAccountId","taskId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_time_entries_invoice_line_id', target: 'InvoiceLine', columnNames: ["businessAccountId","invoiceLineId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_time_entries_task_case', target: 'Task', columnNames: ["businessAccountId","taskId","caseId"], referencedColumnNames: ["businessAccountId","id","caseId"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const time_entryTable: SqlTable<TimeEntry> = {
  schema: time_entrySchema, tableName: 'time_entries', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'memberId', name: 'member_id', value: entity => entity.memberId },
    { property: 'taskId', name: 'task_id', value: entity => entity.taskId },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'startedAt', name: 'started_at', value: entity => entity.startedAt },
    { property: 'endedAt', name: 'ended_at', value: entity => entity.endedAt },
    { property: 'durationMinutes', name: 'duration_minutes', value: entity => entity.durationMinutes },
    { property: 'billable', name: 'billable', value: entity => entity.billable },
    { property: 'hourlyRate', name: 'hourly_rate', value: entity => entity.hourlyRate },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'invoiceLineId', name: 'invoice_line_id', value: entity => entity.invoiceLineId },
  ],
  read: row => {
    const entity = new TimeEntry();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = sqlString(row.caseId);
    entity.memberId = sqlString(row.memberId);
    entity.taskId = row.taskId === null ? null : sqlString(row.taskId);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.startedAt = row.startedAt === null ? null : sqlTimestamp(row.startedAt);
    entity.endedAt = row.endedAt === null ? null : sqlTimestamp(row.endedAt);
    entity.durationMinutes = sqlInteger(row.durationMinutes);
    entity.billable = sqlBoolean(row.billable);
    entity.hourlyRate = row.hourlyRate === null ? null : sqlString(row.hourlyRate);
    entity.currency = row.currency === null ? null : sqlString(row.currency);
    entity.invoiceLineId = row.invoiceLineId === null ? null : sqlString(row.invoiceLineId);
    return entity;
  },
};
