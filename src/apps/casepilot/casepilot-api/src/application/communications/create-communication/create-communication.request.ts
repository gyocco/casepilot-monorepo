import { Request } from '@casepilot/cqrs';

export interface CreateCommunicationData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly memberId?: string | null;
  readonly type: 'EMAIL' | 'PHONE' | 'MEETING' | 'MESSAGE' | 'LETTER';
  readonly direction?: 'INBOUND' | 'OUTBOUND' | null;
  readonly subject?: string | null;
  readonly body?: string | null;
  readonly occurredAt: string;
  readonly externalReference?: string | null;
}
export class CreateCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCommunicationData) { super(); }
}
