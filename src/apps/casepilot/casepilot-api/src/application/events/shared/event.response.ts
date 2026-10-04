import { Response } from '@casepilot/cqrs';
import type { Event } from '../../../domain/entities/event.js';

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
