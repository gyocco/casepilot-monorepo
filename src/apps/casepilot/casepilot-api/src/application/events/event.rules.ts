import type { Event } from '../../domain/entities/event.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateChronology } from '../shared/crud-validation.js';
import { validateReference } from '../shared/crud-relations.js';
export const eventFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'title', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'eventType', kind: 'string', nullable: true },
  { name: 'startsAt', kind: 'timestamp', nullable: false },
  { name: 'endsAt', kind: 'timestamp', nullable: true },
  { name: 'allDay', kind: 'boolean', nullable: false },
  { name: 'location', kind: 'string', nullable: true },
  { name: 'createdByMemberId', kind: 'uuid', nullable: false },
];
export const eventSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'title', 'eventType', 'startsAt', 'endsAt', 'allDay', 'location', 'createdByMemberId'];
export async function validateEventRelations(entity: Event, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.createdByMemberId, entity.businessAccountId);
  validateChronology(entity.startsAt, entity.endsAt);
}
