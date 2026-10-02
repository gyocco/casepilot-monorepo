import type { Invoice } from '../../domain/entities/invoice.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';
import { validateChronology } from '../shared/crud-validation.js';
import { validateReference } from '../shared/crud-relations.js';
export const invoiceFields: readonly FieldRule[] = [
  { name: 'externalPartyId', kind: 'uuid', nullable: false },
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'number', kind: 'string', nullable: false },
  { name: 'status', kind: 'string', nullable: false, choices: ['DRAFT', 'ISSUED', 'PAID', 'VOID', 'OVERDUE'] },
  { name: 'currency', kind: 'string', nullable: false },
  { name: 'issueDate', kind: 'date', nullable: false },
  { name: 'dueDate', kind: 'date', nullable: true },
  { name: 'subtotal', kind: 'decimal', nullable: false },
  { name: 'taxAmount', kind: 'decimal', nullable: false },
  { name: 'total', kind: 'decimal', nullable: false },
  { name: 'balanceDue', kind: 'decimal', nullable: false },
  { name: 'notes', kind: 'text', nullable: true },
];
export const invoiceSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'externalPartyId', 'caseId', 'number', 'status', 'currency', 'issueDate', 'dueDate', 'subtotal', 'taxAmount', 'total', 'balanceDue'];
export async function validateInvoiceRelations(entity: Invoice, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'external_parties', entity.externalPartyId, entity.businessAccountId);
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  validateChronology(entity.issueDate, entity.dueDate);
}
