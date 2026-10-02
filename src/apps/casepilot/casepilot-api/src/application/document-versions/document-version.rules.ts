import type { DocumentVersion } from '../../domain/entities/document-version.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference } from '../shared/crud-relations.js';
export const document_versionFields: readonly FieldRule[] = [
  { name: 'documentId', kind: 'uuid', nullable: false },
  { name: 'versionNumber', kind: 'integer', nullable: false },
  { name: 'storageKey', kind: 'string', nullable: false },
  { name: 'fileName', kind: 'string', nullable: false },
  { name: 'mimeType', kind: 'string', nullable: false },
  { name: 'sizeBytes', kind: 'bigint', nullable: false },
  { name: 'checksum', kind: 'string', nullable: true },
  { name: 'uploadedByMemberId', kind: 'uuid', nullable: false },
];
export const document_versionSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'documentId', 'versionNumber', 'storageKey', 'fileName', 'mimeType', 'sizeBytes', 'checksum', 'uploadedByMemberId'];
export async function validateDocumentVersionRelations(entity: DocumentVersion, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'documents', entity.documentId, entity.businessAccountId);
  await validateReference(references, 'members', entity.uploadedByMemberId, entity.businessAccountId);
}
