import { Response } from '@casepilot/cqrs';
import type { Task } from '../../../domain/entities/task.js';

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
