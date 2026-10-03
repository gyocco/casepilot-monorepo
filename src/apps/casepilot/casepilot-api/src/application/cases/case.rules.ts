import type { Case } from '../../domain/entities/case.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateChronology } from '../shared/crud-validation.js';
import { validateReference } from '../shared/crud-relations.js';
export const caseFields: readonly FieldRule[] = [
  { name: 'caseTypeId', kind: 'uuid', nullable: true },
  { name: 'number', kind: 'string', nullable: true },
  { name: 'externalReference', kind: 'string', nullable: true },
  { name: 'title', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'status', kind: 'string', nullable: false },
  { name: 'priority', kind: 'string', nullable: true, choices: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
  { name: 'openedAt', kind: 'timestamp', nullable: true },
  { name: 'closedAt', kind: 'timestamp', nullable: true },
  { name: 'responsibleMemberId', kind: 'uuid', nullable: true },
  { name: 'billingType', kind: 'string', nullable: true, choices: ['HOURLY', 'FIXED', 'RETAINER', 'NON_BILLABLE'] },
  { name: 'hourlyRate', kind: 'decimal', nullable: true, nonnegative: true },
  { name: 'currency', kind: 'string', nullable: true, pattern: /^[A-Z]{3}$/ },
  { name: 'createdByMemberId', kind: 'uuid', nullable: false },
];
export const caseSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseTypeId', 'number', 'externalReference', 'title', 'status', 'priority', 'openedAt', 'closedAt', 'responsibleMemberId', 'billingType', 'hourlyRate', 'currency', 'createdByMemberId'];
export async function validateCaseRelations(entity: Case, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'case_types', entity.caseTypeId, entity.businessAccountId);
  await validateReference(references, 'members', entity.responsibleMemberId, entity.businessAccountId);
  await validateReference(references, 'members', entity.createdByMemberId, entity.businessAccountId);
  validateChronology(entity.openedAt, entity.closedAt);
}
