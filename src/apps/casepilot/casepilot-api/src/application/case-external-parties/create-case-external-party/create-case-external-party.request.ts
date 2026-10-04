import { Request } from '@casepilot/cqrs';

export interface CreateCaseExternalPartyData {
  readonly caseId: string;
  readonly externalPartyId: string;
  readonly role: string;
  readonly isPrimary: boolean;
  readonly notes?: string | null;
}
export class CreateCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseExternalPartyData) { super(); }
}
