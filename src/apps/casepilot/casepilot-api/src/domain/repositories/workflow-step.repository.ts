import type { DataRepository } from './data.repository.js';
import type { WorkflowStep } from '../entities/workflow-step.js';
export interface WorkflowStepRepository extends DataRepository<WorkflowStep> {
  readonly entityType?: WorkflowStep;
}
