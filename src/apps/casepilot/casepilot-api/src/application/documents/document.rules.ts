import { ValidationError } from '@casepilot/abstractions';
import type { Document } from '../../domain/entities/document.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const documentFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'externalPartyId', kind: 'uuid', nullable: true },
  { name: 'folderId', kind: 'uuid', nullable: true },
  { name: 'name', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'documentType', kind: 'string', nullable: true },
  { name: 'currentVersionId', kind: 'uuid', nullable: true },
  { name: 'createdByMemberId', kind: 'uuid', nullable: false },
];
export const documentSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'externalPartyId', 'folderId', 'name', 'documentType', 'currentVersionId', 'createdByMemberId'];
export async function validateDocumentRelations(entity: Document, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'external_parties', entity.externalPartyId, entity.businessAccountId);
  await validateReference(references, 'folders', entity.folderId, entity.businessAccountId);
  const currentVersion = await validateReference(references, 'document_versions', entity.currentVersionId, entity.businessAccountId);
  await validateReference(references, 'members', entity.createdByMemberId, entity.businessAccountId);
  if (currentVersion !== null && currentVersion.parentId !== entity.id) throw new ValidationError('The current version must belong to this document.');
}
