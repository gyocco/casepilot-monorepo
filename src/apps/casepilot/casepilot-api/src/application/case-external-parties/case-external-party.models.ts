import { Request, Response } from '@casepilot/cqrs';
import type { CaseExternalParty } from '../../domain/entities/case-external-party.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateCaseExternalPartyData {
  readonly caseId: string;
  readonly externalPartyId: string;
  readonly role: string;
  readonly isPrimary: boolean;
  readonly notes?: string | null;
}
export interface UpdateCaseExternalPartyData {
  readonly caseId?: string;
  readonly externalPartyId?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
  readonly notes?: string | null;
}
export class CaseExternalPartyResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly externalPartyId: string,
    public readonly role: string,
    public readonly isPrimary: boolean,
    public readonly notes: string | null,
  ) { super(); }
}
export function toCaseExternalPartyResponse(entity: CaseExternalParty): CaseExternalPartyResponse {
  return new CaseExternalPartyResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.externalPartyId, entity.role, entity.isPrimary, entity.notes);
}
export class CreateCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseExternalPartyData) { super(); }
}
export class CreateCaseExternalPartyResponse extends Response {
  constructor(public readonly item: CaseExternalPartyResponse) { super(); }
}
export class GetCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCaseExternalPartyResponse extends Response {
  constructor(public readonly item: CaseExternalPartyResponse) { super(); }
}
export class UpdateCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseExternalPartyData) { super(); }
}
export class UpdateCaseExternalPartyResponse extends Response {
  constructor(public readonly item: CaseExternalPartyResponse) { super(); }
}
export class DeleteCaseExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCaseExternalPartyResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCaseExternalPartiesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCaseExternalPartiesResponse extends Response {
  constructor(public readonly items: readonly CaseExternalPartyResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
