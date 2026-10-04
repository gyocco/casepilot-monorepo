import { Request } from '@casepilot/cqrs';

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
export class UpdateEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateEventData) { super(); }
}
