import { Request, Response } from '@casepilot/cqrs';
import type { Task } from '../../domain/entities/task.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateTaskData {
  readonly caseId?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly status: string;
  readonly priority?: string | null;
  readonly assignedMemberId?: string | null;
  readonly createdByMemberId: string;
  readonly dueAt?: string | null;
  readonly completedAt?: string | null;
}
export interface UpdateTaskData {
  readonly caseId?: string | null;
  readonly title?: string;
  readonly description?: string | null;
  readonly status?: string;
  readonly priority?: string | null;
  readonly assignedMemberId?: string | null;
  readonly createdByMemberId?: string;
  readonly dueAt?: string | null;
  readonly completedAt?: string | null;
}
export class TaskResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly priority: string | null,
    public readonly assignedMemberId: string | null,
    public readonly createdByMemberId: string,
    public readonly dueAt: string | null,
    public readonly completedAt: string | null,
  ) { super(); }
}
export function toTaskResponse(entity: Task): TaskResponse {
  return new TaskResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.title, entity.description, entity.status, entity.priority, entity.assignedMemberId, entity.createdByMemberId, entity.dueAt, entity.completedAt);
}
export class CreateTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateTaskData) { super(); }
}
export class CreateTaskResponse extends Response {
  constructor(public readonly item: TaskResponse) { super(); }
}
export class GetTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetTaskResponse extends Response {
  constructor(public readonly item: TaskResponse) { super(); }
}
export class UpdateTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateTaskData) { super(); }
}
export class UpdateTaskResponse extends Response {
  constructor(public readonly item: TaskResponse) { super(); }
}
export class DeleteTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteTaskResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListTasksRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListTasksResponse extends Response {
  constructor(public readonly items: readonly TaskResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
