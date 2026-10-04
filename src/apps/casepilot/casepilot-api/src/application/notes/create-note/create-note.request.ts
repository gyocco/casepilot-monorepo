import { Request } from '@casepilot/cqrs';

export interface CreateNoteData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly authorMemberId: string;
  readonly title?: string | null;
  readonly body: string;
  readonly isPrivate: boolean;
}
export class CreateNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateNoteData) { super(); }
}
