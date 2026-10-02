import { Request, Response } from '@casepilot/cqrs';
import type { WorkflowStep } from '../../domain/entities/workflow-step.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateWorkflowStepData {
  readonly workflowId: string;
  readonly statusDefinitionId?: string | null;
  readonly name: string;
  readonly description?: string | null;
  readonly sortOrder: number;
  readonly isInitial: boolean;
  readonly isTerminal: boolean;
}
export interface UpdateWorkflowStepData {
  readonly workflowId?: string;
  readonly statusDefinitionId?: string | null;
  readonly name?: string;
  readonly description?: string | null;
  readonly sortOrder?: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
}
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
export class CreateWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateWorkflowStepData) { super(); }
}
export class CreateWorkflowStepResponse extends Response {
  constructor(public readonly item: WorkflowStepResponse) { super(); }
}
export class GetWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetWorkflowStepResponse extends Response {
  constructor(public readonly item: WorkflowStepResponse) { super(); }
}
export class UpdateWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowStepData) { super(); }
}
export class UpdateWorkflowStepResponse extends Response {
  constructor(public readonly item: WorkflowStepResponse) { super(); }
}
export class DeleteWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteWorkflowStepResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListWorkflowStepsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListWorkflowStepsResponse extends Response {
  constructor(public readonly items: readonly WorkflowStepResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
