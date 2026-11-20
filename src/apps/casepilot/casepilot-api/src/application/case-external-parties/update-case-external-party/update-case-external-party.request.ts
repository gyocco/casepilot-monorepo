import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateCaseExternalPartyData {
  readonly caseId?: string;
  readonly externalPartyId?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
  readonly notes?: string | null;
}
export class UpdateCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseExternalPartyData, public readonly actor: VerifiedIdentity) { super(); }
}
