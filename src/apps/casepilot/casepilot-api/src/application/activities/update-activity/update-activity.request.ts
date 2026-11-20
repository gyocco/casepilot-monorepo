import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';
import type { JsonValue } from '@casepilot/abstractions';

export interface UpdateActivityData {
  readonly actorMemberId?: string | null;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly caseId?: string | null;
  readonly metadata?: JsonValue | null;
  readonly occurredAt?: string;
}
export class UpdateActivityRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateActivityData, public readonly actor: VerifiedIdentity) { super(); }
}
