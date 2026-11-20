import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateExternalPartyData {
  readonly type: 'PERSON' | 'ORGANIZATION';
  readonly displayName: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly legalName?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly addressLine_1?: string | null;
  readonly addressLine_2?: string | null;
  readonly city?: string | null;
  readonly region?: string | null;
  readonly postalCode?: string | null;
  readonly countryCode?: string | null;
  readonly notes?: string | null;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null;
}
export class CreateExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateExternalPartyData, public readonly actor: VerifiedIdentity) { super(); }
}
