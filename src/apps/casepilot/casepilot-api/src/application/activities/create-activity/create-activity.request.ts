import { Request } from '@casepilot/cqrs';
import type { JsonValue } from '@casepilot/abstractions';

export interface CreateActivityData {
  readonly actorMemberId?: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly caseId?: string | null;
  readonly metadata?: JsonValue | null;
  readonly occurredAt: string;
}
export class CreateActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateActivityData) { super(); }
}
