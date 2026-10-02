import type { Folder } from '../../domain/entities/folder.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference, validateFolderParent } from '../shared/crud-relations.js';
export const folderFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: true },
  { name: 'parentFolderId', kind: 'uuid', nullable: true },
  { name: 'name', kind: 'string', nullable: false },
  { name: 'createdByMemberId', kind: 'uuid', nullable: false },
];
export const folderSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'parentFolderId', 'name', 'createdByMemberId'];
export async function validateFolderRelations(entity: Folder, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.createdByMemberId, entity.businessAccountId);
  await validateFolderParent(references, entity.id, entity.parentFolderId, entity.businessAccountId);
}
