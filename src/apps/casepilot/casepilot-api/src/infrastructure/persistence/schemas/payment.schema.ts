import { EntitySchema } from 'typeorm';
import { Payment } from '../../../domain/entities/payment.js';
import type { SqlTable } from '@casepilot/abstractions/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/abstractions/typeorm';
export const paymentSchema = new EntitySchema<Payment>({
  name: 'Payment', target: Payment, tableName: 'payments',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    invoiceId: { name: 'invoice_id', type: 'uuid', nullable: false },
    amount: { name: 'amount', type: 'numeric', nullable: false, precision: 20, scale: 4 },
    currency: { name: 'currency', type: 'varchar', nullable: false, length: 255 },
    paymentMethod: { name: 'payment_method', type: 'varchar', nullable: true, length: 255 },
    reference: { name: 'reference', type: 'varchar', nullable: true, length: 255 },
    paidAt: { name: 'paid_at', type: 'timestamptz', nullable: false },
    notes: { name: 'notes', type: 'text', nullable: true },
  },
  uniques: [
    { name: 'uq_payments_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_payments_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_payments_1', columns: ["businessAccountId","invoiceId"] },
  ],
  foreignKeys: [
    { name: 'fk_payments_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_payments_invoice_id', target: 'Invoice', columnNames: ["businessAccountId","invoiceId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const paymentTable: SqlTable<Payment> = {
  schema: paymentSchema, tableName: 'payments', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'invoiceId', name: 'invoice_id', value: entity => entity.invoiceId },
    { property: 'amount', name: 'amount', value: entity => entity.amount },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'paymentMethod', name: 'payment_method', value: entity => entity.paymentMethod },
    { property: 'reference', name: 'reference', value: entity => entity.reference },
    { property: 'paidAt', name: 'paid_at', value: entity => entity.paidAt },
    { property: 'notes', name: 'notes', value: entity => entity.notes },
  ],
  read: row => {
    const entity = new Payment();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.invoiceId = sqlString(row.invoiceId);
    entity.amount = sqlString(row.amount);
    entity.currency = sqlString(row.currency);
    entity.paymentMethod = row.paymentMethod === null ? null : sqlString(row.paymentMethod);
    entity.reference = row.reference === null ? null : sqlString(row.reference);
    entity.paidAt = sqlTimestamp(row.paidAt);
    entity.notes = row.notes === null ? null : sqlString(row.notes);
    return entity;
  },
};
