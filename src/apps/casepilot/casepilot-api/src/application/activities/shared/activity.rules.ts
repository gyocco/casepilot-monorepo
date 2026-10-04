import type { Activity } from '../../../domain/entities/activity.js';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateReference, validateTarget } from '../../shared/crud-relations.js';

export const activityFields: readonly FieldRule[] = [
  { name: 'actorMemberId', kind: 'uuid', nullable: true },
  { name: 'action', kind: 'string', nullable: false },
  { name: 'entityType', kind: 'string', nullable: false },
  { name: 'entityId', kind: 'uuid', nullable: false },
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'metadata', kind: 'json', nullable: true },
  { name: 'occurredAt', kind: 'timestamp', nullable: false },
];

export const activitySortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'actorMemberId', 'action', 'entityType', 'entityId', 'caseId', 'occurredAt'];

export async function validateActivityRelations(entity: Activity, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'members', entity.actorMemberId, entity.businessAccountId);
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateTarget(references, entity.entityType, entity.entityId, entity.businessAccountId);
}
