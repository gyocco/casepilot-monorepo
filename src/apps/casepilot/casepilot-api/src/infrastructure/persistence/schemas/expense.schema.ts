import { EntitySchema } from 'typeorm';
import { Expense } from '../../../domain/entities/expense.js';
import type { SqlTable } from '@casepilot/abstractions/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlDate, sqlBoolean } from '@casepilot/abstractions/typeorm';
export const expenseSchema = new EntitySchema<Expense>({
  name: 'Expense', target: Expense, tableName: 'expenses',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: false },
    memberId: { name: 'member_id', type: 'uuid', nullable: true },
    description: { name: 'description', type: 'varchar', nullable: false, length: 255 },
    amount: { name: 'amount', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    currency: { name: 'currency', type: 'varchar', nullable: false, length: 255 },
    occurredOn: { name: 'occurred_on', type: 'date', nullable: false },
    billable: { name: 'billable', type: 'boolean', nullable: false },
    invoiceLineId: { name: 'invoice_line_id', type: 'uuid', nullable: true },
    documentId: { name: 'document_id', type: 'uuid', nullable: true },
  },
  uniques: [
    { name: 'uq_expenses_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_expenses_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_expenses_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_expenses_2', columns: ["businessAccountId","memberId"] },
    { name: 'idx_expenses_3', columns: ["businessAccountId","invoiceLineId"] },
    { name: 'idx_expenses_4', columns: ["businessAccountId","documentId"] },
  ],
  foreignKeys: [
    { name: 'fk_expenses_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_expenses_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_expenses_member_id', target: 'Member', columnNames: ["businessAccountId","memberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_expenses_invoice_line_id', target: 'InvoiceLine', columnNames: ["businessAccountId","invoiceLineId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_expenses_document_id', target: 'Document', columnNames: ["businessAccountId","documentId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const expenseTable: SqlTable<Expense> = {
  schema: expenseSchema, tableName: 'expenses', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'memberId', name: 'member_id', value: entity => entity.memberId },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'amount', name: 'amount', value: entity => entity.amount },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'occurredOn', name: 'occurred_on', value: entity => entity.occurredOn },
    { property: 'billable', name: 'billable', value: entity => entity.billable },
    { property: 'invoiceLineId', name: 'invoice_line_id', value: entity => entity.invoiceLineId },
    { property: 'documentId', name: 'document_id', value: entity => entity.documentId },
  ],
  read: row => {
    const entity = new Expense();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = sqlString(row.caseId);
    entity.memberId = row.memberId === null ? null : sqlString(row.memberId);
    entity.description = sqlString(row.description);
    entity.amount = sqlString(row.amount);
    entity.currency = sqlString(row.currency);
    entity.occurredOn = sqlDate(row.occurredOn);
    entity.billable = sqlBoolean(row.billable);
    entity.invoiceLineId = row.invoiceLineId === null ? null : sqlString(row.invoiceLineId);
    entity.documentId = row.documentId === null ? null : sqlString(row.documentId);
    return entity;
  },
};
