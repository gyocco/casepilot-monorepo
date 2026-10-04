import { Response } from '@casepilot/cqrs';
import type { Workflow } from '../../../domain/entities/workflow.js';

export class WorkflowResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
  ) { super(); }
}
export function toWorkflowResponse(entity: Workflow): WorkflowResponse {
  return new WorkflowResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.name, entity.description, entity.isActive);
}
