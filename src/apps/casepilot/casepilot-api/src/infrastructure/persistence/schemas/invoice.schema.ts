import { EntitySchema } from 'typeorm';
import { Invoice } from '../../../domain/entities/invoice.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice, sqlDate } from '../sql-values.js';
export const invoiceSchema = new EntitySchema<Invoice>({
  name: 'Invoice', target: Invoice, tableName: 'invoices',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    externalPartyId: { name: 'external_party_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    number: { name: 'number', type: 'varchar', nullable: false, length: 255 },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    currency: { name: 'currency', type: 'varchar', nullable: false, length: 255 },
    issueDate: { name: 'issue_date', type: 'date', nullable: false },
    dueDate: { name: 'due_date', type: 'date', nullable: true },
    subtotal: { name: 'subtotal', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    taxAmount: { name: 'tax_amount', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    total: { name: 'total', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    balanceDue: { name: 'balance_due', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    notes: { name: 'notes', type: 'text', nullable: true },
  },
  uniques: [
    { name: 'uq_invoices_0', columns: ["businessAccountId","id"] },
    { name: 'uq_invoices_1', columns: ["businessAccountId","number"] },
  ],
  indices: [
    { name: 'idx_invoices_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_invoices_1', columns: ["businessAccountId","status"] },
    { name: 'idx_invoices_2', columns: ["externalPartyId"] },
    { name: 'idx_invoices_3', columns: ["businessAccountId","externalPartyId"] },
    { name: 'idx_invoices_4', columns: ["businessAccountId","caseId"] },
  ],
  foreignKeys: [
    { name: 'fk_invoices_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_invoices_external_party_id', target: 'ExternalParty', columnNames: ["businessAccountId","externalPartyId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_invoices_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const invoiceTable: SqlTable<Invoice> = {
  schema: invoiceSchema, tableName: 'invoices', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'externalPartyId', name: 'external_party_id', value: entity => entity.externalPartyId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'number', name: 'number', value: entity => entity.number },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'issueDate', name: 'issue_date', value: entity => entity.issueDate },
    { property: 'dueDate', name: 'due_date', value: entity => entity.dueDate },
    { property: 'subtotal', name: 'subtotal', value: entity => entity.subtotal },
    { property: 'taxAmount', name: 'tax_amount', value: entity => entity.taxAmount },
    { property: 'total', name: 'total', value: entity => entity.total },
    { property: 'balanceDue', name: 'balance_due', value: entity => entity.balanceDue },
    { property: 'notes', name: 'notes', value: entity => entity.notes },
  ],
  read: row => {
    const entity = new Invoice();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.externalPartyId = sqlString(row.externalPartyId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.number = sqlString(row.number);
    entity.status = sqlChoice(row.status, ['DRAFT', 'ISSUED', 'PAID', 'VOID', 'OVERDUE'] as const);
    entity.currency = sqlString(row.currency);
    entity.issueDate = sqlDate(row.issueDate);
    entity.dueDate = row.dueDate === null ? null : sqlDate(row.dueDate);
    entity.subtotal = sqlString(row.subtotal);
    entity.taxAmount = sqlString(row.taxAmount);
    entity.total = sqlString(row.total);
    entity.balanceDue = sqlString(row.balanceDue);
    entity.notes = row.notes === null ? null : sqlString(row.notes);
    return entity;
  },
};
