import type { CaseMember } from '../../../domain/entities/case-member.js';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateChronology } from '../../shared/crud-validation.js';
import { validateReference } from '../../shared/crud-relations.js';

export const case_memberFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: false },
  { name: 'memberId', kind: 'uuid', nullable: false },
  { name: 'role', kind: 'string', nullable: true },
  { name: 'isPrimary', kind: 'boolean', nullable: false },
  { name: 'assignedAt', kind: 'timestamp', nullable: false },
  { name: 'removedAt', kind: 'timestamp', nullable: true },
];

export const case_memberSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'memberId', 'role', 'isPrimary', 'assignedAt', 'removedAt'];

export async function validateCaseMemberRelations(entity: CaseMember, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.memberId, entity.businessAccountId);
  validateChronology(entity.assignedAt, entity.removedAt);
}
