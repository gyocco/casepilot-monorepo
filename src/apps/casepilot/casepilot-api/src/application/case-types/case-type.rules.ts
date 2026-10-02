import type { CaseType } from '../../domain/entities/case-type.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference } from '../shared/crud-relations.js';
export const case_typeFields: readonly FieldRule[] = [
  { name: 'name', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'code', kind: 'string', nullable: true },
  { name: 'isActive', kind: 'boolean', nullable: false },
  { name: 'defaultWorkflowId', kind: 'uuid', nullable: true },
];
export const case_typeSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'name', 'code', 'isActive', 'defaultWorkflowId'];
export async function validateCaseTypeRelations(entity: CaseType, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'workflows', entity.defaultWorkflowId, entity.businessAccountId);
}
