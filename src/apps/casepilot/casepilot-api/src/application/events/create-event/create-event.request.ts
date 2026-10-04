import { Request } from '@casepilot/cqrs';

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
export class CreateEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateEventData) { super(); }
}
