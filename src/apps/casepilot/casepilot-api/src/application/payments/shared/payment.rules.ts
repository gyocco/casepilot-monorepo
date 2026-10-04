import type { Payment } from '../../../domain/entities/payment.js';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateReference } from '../../shared/crud-relations.js';

export const paymentFields: readonly FieldRule[] = [
  { name: 'invoiceId', kind: 'uuid', nullable: false },
  { name: 'amount', kind: 'decimal', nullable: false, nonnegative: true },
  { name: 'currency', kind: 'string', nullable: false, pattern: /^[A-Z]{3}$/ },
  { name: 'paymentMethod', kind: 'string', nullable: true },
  { name: 'reference', kind: 'string', nullable: true },
  { name: 'paidAt', kind: 'timestamp', nullable: false },
  { name: 'notes', kind: 'text', nullable: true },
];

export const paymentSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'invoiceId', 'amount', 'currency', 'paymentMethod', 'reference', 'paidAt'];

export async function validatePaymentRelations(entity: Payment, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'invoices', entity.invoiceId, entity.businessAccountId);
}
