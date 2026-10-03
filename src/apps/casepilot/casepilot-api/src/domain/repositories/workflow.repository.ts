import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Workflow } from '../entities/workflow.js';
export interface WorkflowRepository extends DataRepository<Workflow> {
  readonly entityType?: Workflow;
}
