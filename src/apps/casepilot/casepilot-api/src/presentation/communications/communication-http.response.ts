import type { CommunicationResponse } from '../../application/communications/communication.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class CommunicationHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly externalPartyId: string | null,
    public readonly memberId: string | null,
    public readonly type: 'EMAIL' | 'PHONE' | 'MEETING' | 'MESSAGE' | 'LETTER',
    public readonly direction: 'INBOUND' | 'OUTBOUND' | null,
    public readonly subject: string | null,
    public readonly body: string | null,
    public readonly occurredAt: string,
    public readonly externalReference: string | null,
  ) {}
}
export function toCommunicationHttpResponse(item: CommunicationResponse): CommunicationHttpResponse {
  return new CommunicationHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.externalPartyId, item.memberId, item.type, item.direction, item.subject, item.body, item.occurredAt, item.externalReference);
}
export class CommunicationItemHttpResponse {
  constructor(public readonly item: CommunicationHttpResponse) {}
}
export class CommunicationsPageHttpResponse {
  constructor(public readonly items: readonly CommunicationHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCommunicationHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
