import type { TaskResponse } from '../../application/tasks/task.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class TaskHttpResponse {
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
  ) {}
}
export function toTaskHttpResponse(item: TaskResponse): TaskHttpResponse {
  return new TaskHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.title, item.description, item.status, item.priority, item.assignedMemberId, item.createdByMemberId, item.dueAt, item.completedAt);
}
export class TaskItemHttpResponse {
  constructor(public readonly item: TaskHttpResponse) {}
}
export class TasksPageHttpResponse {
  constructor(public readonly items: readonly TaskHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteTaskHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
