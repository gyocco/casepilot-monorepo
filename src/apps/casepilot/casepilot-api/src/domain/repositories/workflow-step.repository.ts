import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { WorkflowStep } from '../entities/workflow-step.js';
export interface WorkflowStepRepository extends DataRepository<WorkflowStep> {
  readonly entityType?: WorkflowStep;
}
