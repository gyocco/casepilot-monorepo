import type { ActivityResponse } from '../../application/activities/activity.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import type { JsonValue } from '@casepilot/abstractions';
export class ActivityHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly actorMemberId: string | null,
    public readonly action: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly caseId: string | null,
    public readonly metadata: JsonValue | null,
    public readonly occurredAt: string,
  ) {}
}
export function toActivityHttpResponse(item: ActivityResponse): ActivityHttpResponse {
  return new ActivityHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.actorMemberId, item.action, item.entityType, item.entityId, item.caseId, item.metadata, item.occurredAt);
}
export class ActivityItemHttpResponse {
  constructor(public readonly item: ActivityHttpResponse) {}
}
export class ActivitiesPageHttpResponse {
  constructor(public readonly items: readonly ActivityHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteActivityHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
