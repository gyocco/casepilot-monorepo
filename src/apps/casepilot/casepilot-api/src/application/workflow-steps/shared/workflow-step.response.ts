import { Response } from '@casepilot/cqrs';
import type { WorkflowStep } from '../../../domain/entities/workflow-step.js';

export class WorkflowStepResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly workflowId: string,
    public readonly statusDefinitionId: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly sortOrder: number,
    public readonly isInitial: boolean,
    public readonly isTerminal: boolean,
  ) { super(); }
}
export function toWorkflowStepResponse(entity: WorkflowStep): WorkflowStepResponse {
  return new WorkflowStepResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.workflowId, entity.statusDefinitionId, entity.name, entity.description, entity.sortOrder, entity.isInitial, entity.isTerminal);
}
