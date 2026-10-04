import { Request } from '@casepilot/cqrs';
import type { JsonValue } from '@casepilot/abstractions';

export interface CreateBusinessAccountData {
  readonly name: string;
  readonly legalName?: string | null;
  readonly slug?: string | null;
  readonly type?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly timezone: string;
  readonly locale: string;
  readonly currency: string;
  readonly countryCode: string;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  readonly settings?: JsonValue | null;
}
export class CreateBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateBusinessAccountData) { super(); }
}
