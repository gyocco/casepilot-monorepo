import type { Workflow } from '../../domain/entities/workflow.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';


export const workflowFields: readonly FieldRule[] = [
  { name: 'name', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'isActive', kind: 'boolean', nullable: false },
];
export const workflowSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'name', 'isActive'];
export function validateWorkflowRelations(entity: Workflow, _references: ReferenceRepository): void {
  void entity;
}
