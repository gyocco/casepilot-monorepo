import { Request, Response } from '@casepilot/cqrs';
import type { Activity } from '../../domain/entities/activity.js';
import type { JsonValue } from '../../domain/entities/stored-entity.js';
import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateActivityData {
  readonly actorMemberId?: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly caseId?: string | null;
  readonly metadata?: JsonValue | null;
  readonly occurredAt: string;
}
export interface UpdateActivityData {
  readonly actorMemberId?: string | null;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly caseId?: string | null;
  readonly metadata?: JsonValue | null;
  readonly occurredAt?: string;
}
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
export class CreateActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateActivityData) { super(); }
}
export class CreateActivityResponse extends Response {
  constructor(public readonly item: ActivityResponse) { super(); }
}
export class GetActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetActivityResponse extends Response {
  constructor(public readonly item: ActivityResponse) { super(); }
}
export class UpdateActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateActivityData) { super(); }
}
export class UpdateActivityResponse extends Response {
  constructor(public readonly item: ActivityResponse) { super(); }
}
export class DeleteActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteActivityResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListActivitiesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListActivitiesResponse extends Response {
  constructor(public readonly items: readonly ActivityResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
