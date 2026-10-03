import type { Expense } from '../../domain/entities/expense.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const expenseFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: false },
  { name: 'memberId', kind: 'uuid', nullable: true },
  { name: 'description', kind: 'string', nullable: false },
  { name: 'amount', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'currency', kind: 'string', nullable: false, pattern: /^[A-Z]{3}$/ },
  { name: 'occurredOn', kind: 'date', nullable: false },
  { name: 'billable', kind: 'boolean', nullable: false },
  { name: 'invoiceLineId', kind: 'uuid', nullable: true },
  { name: 'documentId', kind: 'uuid', nullable: true },
];
export const expenseSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'memberId', 'description', 'amount', 'currency', 'occurredOn', 'billable', 'invoiceLineId', 'documentId'];
export async function validateExpenseRelations(entity: Expense, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.memberId, entity.businessAccountId);
  await validateReference(references, 'invoice_lines', entity.invoiceLineId, entity.businessAccountId);
  await validateReference(references, 'documents', entity.documentId, entity.businessAccountId);
}
