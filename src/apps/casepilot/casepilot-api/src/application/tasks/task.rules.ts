import type { Task } from '../../domain/entities/task.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const taskFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'title', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'status', kind: 'string', nullable: false },
  { name: 'priority', kind: 'string', nullable: true },
  { name: 'assignedMemberId', kind: 'uuid', nullable: true },
  { name: 'createdByMemberId', kind: 'uuid', nullable: false },
  { name: 'dueAt', kind: 'timestamp', nullable: true },
  { name: 'completedAt', kind: 'timestamp', nullable: true },
];
export const taskSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'title', 'status', 'priority', 'assignedMemberId', 'createdByMemberId', 'dueAt', 'completedAt'];
export async function validateTaskRelations(entity: Task, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.assignedMemberId, entity.businessAccountId);
  await validateReference(references, 'members', entity.createdByMemberId, entity.businessAccountId);
}
