import type { Deadline } from '../../domain/entities/deadline.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference } from '../shared/crud-relations.js';
export const deadlineFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: false },
  { name: 'title', kind: 'string', nullable: false },
  { name: 'dueAt', kind: 'timestamp', nullable: false },
  { name: 'status', kind: 'string', nullable: false, choices: ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED'] },
  { name: 'responsibleMemberId', kind: 'uuid', nullable: true },
  { name: 'completedAt', kind: 'timestamp', nullable: true },
  { name: 'notes', kind: 'text', nullable: true },
];
export const deadlineSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'title', 'dueAt', 'status', 'responsibleMemberId', 'completedAt'];
export async function validateDeadlineRelations(entity: Deadline, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.responsibleMemberId, entity.businessAccountId);
}
