import type { EntityManager } from 'typeorm';
import type { WorkflowStep } from '../../../domain/entities/workflow-step.js';
import type { WorkflowStepRepository } from '../../../domain/repositories/workflow-step.repository.js';
import { workflow_stepTable } from '../schemas/workflow-step.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmWorkflowStepRepository extends TypeOrmDataRepository<WorkflowStep> implements WorkflowStepRepository {
  constructor(manager: EntityManager) { super(manager, workflow_stepTable); }
}
