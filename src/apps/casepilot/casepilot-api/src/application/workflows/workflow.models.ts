import { Request, Response } from '@casepilot/cqrs';
import type { Workflow } from '../../domain/entities/workflow.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateWorkflowData {
  readonly name: string;
  readonly description?: string | null;
  readonly isActive: boolean;
}
export interface UpdateWorkflowData {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}
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
export class CreateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateWorkflowData) { super(); }
}
export class CreateWorkflowResponse extends Response {
  constructor(public readonly item: WorkflowResponse) { super(); }
}
export class GetWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetWorkflowResponse extends Response {
  constructor(public readonly item: WorkflowResponse) { super(); }
}
export class UpdateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowData) { super(); }
}
export class UpdateWorkflowResponse extends Response {
  constructor(public readonly item: WorkflowResponse) { super(); }
}
export class DeleteWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteWorkflowResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListWorkflowsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListWorkflowsResponse extends Response {
  constructor(public readonly items: readonly WorkflowResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
