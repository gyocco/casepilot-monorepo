import type { EventResponse } from '../../application/events/event.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class EventHttpResponse {
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
  ) {}
}
export function toEventHttpResponse(item: EventResponse): EventHttpResponse {
  return new EventHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.title, item.description, item.eventType, item.startsAt, item.endsAt, item.allDay, item.location, item.createdByMemberId);
}
export class EventItemHttpResponse {
  constructor(public readonly item: EventHttpResponse) {}
}
export class EventsPageHttpResponse {
  constructor(public readonly items: readonly EventHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteEventHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
