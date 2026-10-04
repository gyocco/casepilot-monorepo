import { Request } from '@casepilot/cqrs';

export class GetEventRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
