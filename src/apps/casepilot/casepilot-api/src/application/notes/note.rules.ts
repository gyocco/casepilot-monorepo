import type { Note } from '../../domain/entities/note.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const noteFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'externalPartyId', kind: 'uuid', nullable: true },
  { name: 'authorMemberId', kind: 'uuid', nullable: false },
  { name: 'title', kind: 'string', nullable: true },
  { name: 'body', kind: 'text', nullable: false },
  { name: 'isPrivate', kind: 'boolean', nullable: false },
];
export const noteSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'externalPartyId', 'authorMemberId', 'title', 'isPrivate'];
export async function validateNoteRelations(entity: Note, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'external_parties', entity.externalPartyId, entity.businessAccountId);
  await validateReference(references, 'members', entity.authorMemberId, entity.businessAccountId);
}
