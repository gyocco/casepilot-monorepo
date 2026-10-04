import type { Communication } from '../../../domain/entities/communication.js';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateReference } from '../../shared/crud-relations.js';

export const communicationFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'externalPartyId', kind: 'uuid', nullable: true },
  { name: 'memberId', kind: 'uuid', nullable: true },
  { name: 'type', kind: 'string', nullable: false, choices: ['EMAIL', 'PHONE', 'MEETING', 'MESSAGE', 'LETTER'] },
  { name: 'direction', kind: 'string', nullable: true, choices: ['INBOUND', 'OUTBOUND'] },
  { name: 'subject', kind: 'string', nullable: true },
  { name: 'body', kind: 'text', nullable: true },
  { name: 'occurredAt', kind: 'timestamp', nullable: false },
  { name: 'externalReference', kind: 'string', nullable: true },
];

export const communicationSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'externalPartyId', 'memberId', 'type', 'direction', 'subject', 'occurredAt', 'externalReference'];

export async function validateCommunicationRelations(entity: Communication, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'external_parties', entity.externalPartyId, entity.businessAccountId);
  await validateReference(references, 'members', entity.memberId, entity.businessAccountId);
}
