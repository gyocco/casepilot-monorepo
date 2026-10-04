import { Response } from '@casepilot/cqrs';
import type { Activity } from '../../../domain/entities/activity.js';
import type { JsonValue } from '@casepilot/abstractions';

export class ActivityResponse extends Response {
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
  ) { super(); }
}
export function toActivityResponse(entity: Activity): ActivityResponse {
  return new ActivityResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.actorMemberId, entity.action, entity.entityType, entity.entityId, entity.caseId, entity.metadata, entity.occurredAt);
}
