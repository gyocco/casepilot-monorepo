import { Request } from '@casepilot/cqrs';

export interface UpdateCommunicationData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly memberId?: string | null;
  readonly type?: 'EMAIL' | 'PHONE' | 'MEETING' | 'MESSAGE' | 'LETTER';
  readonly direction?: 'INBOUND' | 'OUTBOUND' | null;
  readonly subject?: string | null;
  readonly body?: string | null;
  readonly occurredAt?: string;
  readonly externalReference?: string | null;
}
export class UpdateCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCommunicationData) { super(); }
}
