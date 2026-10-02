import { Request, Response } from '@casepilot/cqrs';
import type { Communication } from '../../domain/entities/communication.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

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
export class CreateCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCommunicationData) { super(); }
}
export class CreateCommunicationResponse extends Response {
  constructor(public readonly item: CommunicationResponse) { super(); }
}
export class GetCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCommunicationResponse extends Response {
  constructor(public readonly item: CommunicationResponse) { super(); }
}
export class UpdateCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCommunicationData) { super(); }
}
export class UpdateCommunicationResponse extends Response {
  constructor(public readonly item: CommunicationResponse) { super(); }
}
export class DeleteCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCommunicationResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCommunicationsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCommunicationsResponse extends Response {
  constructor(public readonly items: readonly CommunicationResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
