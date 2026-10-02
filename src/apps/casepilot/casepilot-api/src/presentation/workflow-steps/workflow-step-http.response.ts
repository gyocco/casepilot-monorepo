import type { WorkflowStepResponse } from '../../application/workflow-steps/workflow-step.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class WorkflowStepHttpResponse {
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
  ) {}
}
export function toWorkflowStepHttpResponse(item: WorkflowStepResponse): WorkflowStepHttpResponse {
  return new WorkflowStepHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.workflowId, item.statusDefinitionId, item.name, item.description, item.sortOrder, item.isInitial, item.isTerminal);
}
export class WorkflowStepItemHttpResponse {
  constructor(public readonly item: WorkflowStepHttpResponse) {}
}
export class WorkflowStepsPageHttpResponse {
  constructor(public readonly items: readonly WorkflowStepHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteWorkflowStepHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
