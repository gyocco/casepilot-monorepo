import type { WorkflowResponse } from '../../application/workflows/workflow.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class WorkflowHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
  ) {}
}
export function toWorkflowHttpResponse(item: WorkflowResponse): WorkflowHttpResponse {
  return new WorkflowHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.name, item.description, item.isActive);
}
export class WorkflowItemHttpResponse {
  constructor(public readonly item: WorkflowHttpResponse) {}
}
export class WorkflowsPageHttpResponse {
  constructor(public readonly items: readonly WorkflowHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteWorkflowHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
