import { Request, Response } from '@casepilot/cqrs';
import type { Event } from '../../domain/entities/event.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateEventData {
  readonly caseId?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly eventType?: string | null;
  readonly startsAt: string;
  readonly endsAt?: string | null;
  readonly allDay: boolean;
  readonly location?: string | null;
  readonly createdByMemberId: string;
}
export interface UpdateEventData {
  readonly caseId?: string | null;
  readonly title?: string;
  readonly description?: string | null;
  readonly eventType?: string | null;
  readonly startsAt?: string;
  readonly endsAt?: string | null;
  readonly allDay?: boolean;
  readonly location?: string | null;
  readonly createdByMemberId?: string;
}
export class EventResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly eventType: string | null,
    public readonly startsAt: string,
    public readonly endsAt: string | null,
    public readonly allDay: boolean,
    public readonly location: string | null,
    public readonly createdByMemberId: string,
  ) { super(); }
}
export function toEventResponse(entity: Event): EventResponse {
  return new EventResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.title, entity.description, entity.eventType, entity.startsAt, entity.endsAt, entity.allDay, entity.location, entity.createdByMemberId);
}
export class CreateEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateEventData) { super(); }
}
export class CreateEventResponse extends Response {
  constructor(public readonly item: EventResponse) { super(); }
}
export class GetEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetEventResponse extends Response {
  constructor(public readonly item: EventResponse) { super(); }
}
export class UpdateEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateEventData) { super(); }
}
export class UpdateEventResponse extends Response {
  constructor(public readonly item: EventResponse) { super(); }
}
export class DeleteEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteEventResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListEventsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListEventsResponse extends Response {
  constructor(public readonly items: readonly EventResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
