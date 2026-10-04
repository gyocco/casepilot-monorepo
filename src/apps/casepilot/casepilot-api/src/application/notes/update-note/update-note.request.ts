import { Request } from '@casepilot/cqrs';

export interface UpdateNoteData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly authorMemberId?: string;
  readonly title?: string | null;
  readonly body?: string;
  readonly isPrivate?: boolean;
}
export class UpdateNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateNoteData) { super(); }
}
