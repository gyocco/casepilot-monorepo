import type { InvoiceLine } from '../../domain/entities/invoice-line.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const invoice_lineFields: readonly FieldRule[] = [
  { name: 'invoiceId', kind: 'uuid', nullable: false },
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'description', kind: 'string', nullable: false },
  { name: 'quantity', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'unitPrice', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'taxRate', kind: 'decimal', nullable: true, nonnegative: true },
  { name: 'subtotal', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'total', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'sortOrder', kind: 'integer', nullable: false },
];
export const invoice_lineSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'invoiceId', 'caseId', 'description', 'quantity', 'unitPrice', 'taxRate', 'subtotal', 'total', 'sortOrder'];
export async function validateInvoiceLineRelations(entity: InvoiceLine, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'invoices', entity.invoiceId, entity.businessAccountId);
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
}
