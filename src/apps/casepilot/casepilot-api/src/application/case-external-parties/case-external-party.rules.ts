import type { CaseExternalParty } from '../../domain/entities/case-external-party.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference } from '../shared/crud-relations.js';
export const case_external_partyFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: false },
  { name: 'externalPartyId', kind: 'uuid', nullable: false },
  { name: 'role', kind: 'string', nullable: false },
  { name: 'isPrimary', kind: 'boolean', nullable: false },
  { name: 'notes', kind: 'text', nullable: true },
];
export const case_external_partySortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'externalPartyId', 'role', 'isPrimary'];
export async function validateCaseExternalPartyRelations(entity: CaseExternalParty, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'external_parties', entity.externalPartyId, entity.businessAccountId);
}
