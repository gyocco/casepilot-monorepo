import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';
import type { JsonValue } from '@casepilot/abstractions';

export interface UpdateBusinessAccountData {
  readonly name?: string;
  readonly legalName?: string | null;
  readonly slug?: string | null;
  readonly type?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly timezone?: string;
  readonly locale?: string;
  readonly currency?: string;
  readonly countryCode?: string;
  readonly status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  readonly settings?: JsonValue | null;
}
export class UpdateBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateBusinessAccountData, public readonly actor: VerifiedIdentity) { super(); }
}
