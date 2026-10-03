import type { WorkflowStep } from '../../domain/entities/workflow-step.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const workflow_stepFields: readonly FieldRule[] = [
  { name: 'workflowId', kind: 'uuid', nullable: false },
  { name: 'statusDefinitionId', kind: 'uuid', nullable: true },
  { name: 'name', kind: 'string', nullable: false },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'sortOrder', kind: 'integer', nullable: false },
  { name: 'isInitial', kind: 'boolean', nullable: false },
  { name: 'isTerminal', kind: 'boolean', nullable: false },
];
export const workflow_stepSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'workflowId', 'statusDefinitionId', 'name', 'sortOrder', 'isInitial', 'isTerminal'];
export async function validateWorkflowStepRelations(entity: WorkflowStep, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'workflows', entity.workflowId, entity.businessAccountId);
  await validateReference(references, 'status_definitions', entity.statusDefinitionId, entity.businessAccountId);
}
