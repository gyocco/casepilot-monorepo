import { Request } from '@casepilot/cqrs';

export interface UpdateCaseExternalPartyData {
  readonly caseId?: string;
  readonly externalPartyId?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
  readonly notes?: string | null;
}
export class UpdateCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseExternalPartyData) { super(); }
}
