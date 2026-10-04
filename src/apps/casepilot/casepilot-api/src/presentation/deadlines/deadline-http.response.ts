import type { DeadlineResponse } from '../../application/deadlines/shared/deadline.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class DeadlineHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly title: string,
    public readonly dueAt: string,
    public readonly status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED',
    public readonly responsibleMemberId: string | null,
    public readonly completedAt: string | null,
    public readonly notes: string | null,
  ) {}
}
export function toDeadlineHttpResponse(item: DeadlineResponse): DeadlineHttpResponse {
  return new DeadlineHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.title, item.dueAt, item.status, item.responsibleMemberId, item.completedAt, item.notes);
}
export class DeadlineItemHttpResponse {
  constructor(public readonly item: DeadlineHttpResponse) {}
}
export class DeadlinesPageHttpResponse {
  constructor(public readonly items: readonly DeadlineHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteDeadlineHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
