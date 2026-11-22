import { EntitySchema } from 'typeorm';
import { InvoiceLine } from '../../../domain/entities/invoice-line.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/persistence/typeorm';
export const invoice_lineSchema = new EntitySchema<InvoiceLine>({
  name: 'InvoiceLine', target: InvoiceLine, tableName: 'invoice_lines',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    invoiceId: { name: 'invoice_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    description: { name: 'description', type: 'varchar', nullable: false, length: 255 },
    quantity: { name: 'quantity', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    unitPrice: { name: 'unit_price', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    taxRate: { name: 'tax_rate', type: 'numeric', nullable: true, precision: 20, scale: 4 },
    subtotal: { name: 'subtotal', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    total: { name: 'total', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    sortOrder: { name: 'sort_order', type: 'integer', nullable: false },
  },
  uniques: [
    { name: 'uq_invoice_lines_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_invoice_lines_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_invoice_lines_1', columns: ["businessAccountId","invoiceId"] },
    { name: 'idx_invoice_lines_2', columns: ["businessAccountId","caseId"] },
  ],
  foreignKeys: [
    { name: 'fk_invoice_lines_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_invoice_lines_invoice_id', target: 'Invoice', columnNames: ["businessAccountId","invoiceId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_invoice_lines_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const invoice_lineTable: SqlTable<InvoiceLine> = {
  schema: invoice_lineSchema, tableName: 'invoice_lines', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'invoiceId', name: 'invoice_id', value: entity => entity.invoiceId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'quantity', name: 'quantity', value: entity => entity.quantity },
    { property: 'unitPrice', name: 'unit_price', value: entity => entity.unitPrice },
    { property: 'taxRate', name: 'tax_rate', value: entity => entity.taxRate },
    { property: 'subtotal', name: 'subtotal', value: entity => entity.subtotal },
    { property: 'total', name: 'total', value: entity => entity.total },
    { property: 'sortOrder', name: 'sort_order', value: entity => entity.sortOrder },
  ],
  read: row => {
    const entity = new InvoiceLine();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.invoiceId = sqlString(row.invoiceId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.description = sqlString(row.description);
    entity.quantity = sqlString(row.quantity);
    entity.unitPrice = sqlString(row.unitPrice);
    entity.taxRate = row.taxRate === null ? null : sqlString(row.taxRate);
    entity.subtotal = sqlString(row.subtotal);
    entity.total = sqlString(row.total);
    entity.sortOrder = sqlInteger(row.sortOrder);
    return entity;
  },
};
