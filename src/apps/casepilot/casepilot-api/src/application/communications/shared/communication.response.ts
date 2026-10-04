import { Response } from '@casepilot/cqrs';
import type { Communication } from '../../../domain/entities/communication.js';

export class CommunicationResponse extends Response {
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
  ) { super(); }
}
export function toCommunicationResponse(entity: Communication): CommunicationResponse {
  return new CommunicationResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.externalPartyId, entity.memberId, entity.type, entity.direction, entity.subject, entity.body, entity.occurredAt, entity.externalReference);
}
