import type { EntityManager } from 'typeorm';
import type { Workflow } from '../../../domain/entities/workflow.js';
import type { WorkflowRepository } from '../../../domain/repositories/workflow.repository.js';
import { workflowTable } from '../schemas/workflow.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmWorkflowRepository extends TypeOrmDataRepository<Workflow> implements WorkflowRepository {
  constructor(manager: EntityManager) { super(manager, workflowTable); }
}
