import { Request, Response } from '@casepilot/cqrs';
import type { ExternalParty } from '../../domain/entities/external-party.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateExternalPartyData {
  readonly type: 'PERSON' | 'ORGANIZATION';
  readonly displayName: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly legalName?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly addressLine_1?: string | null;
  readonly addressLine_2?: string | null;
  readonly city?: string | null;
  readonly region?: string | null;
  readonly postalCode?: string | null;
  readonly countryCode?: string | null;
  readonly notes?: string | null;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null;
}
export interface UpdateExternalPartyData {
  readonly type?: 'PERSON' | 'ORGANIZATION';
  readonly displayName?: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly legalName?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly addressLine_1?: string | null;
  readonly addressLine_2?: string | null;
  readonly city?: string | null;
  readonly region?: string | null;
  readonly postalCode?: string | null;
  readonly countryCode?: string | null;
  readonly notes?: string | null;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null;
}
export class ExternalPartyResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly type: 'PERSON' | 'ORGANIZATION',
    public readonly displayName: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly legalName: string | null,
    public readonly taxId: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly website: string | null,
    public readonly addressLine_1: string | null,
    public readonly addressLine_2: string | null,
    public readonly city: string | null,
    public readonly region: string | null,
    public readonly postalCode: string | null,
    public readonly countryCode: string | null,
    public readonly notes: string | null,
    public readonly status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null,
  ) { super(); }
}
export function toExternalPartyResponse(entity: ExternalParty): ExternalPartyResponse {
  return new ExternalPartyResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.type, entity.displayName, entity.firstName, entity.lastName, entity.legalName, entity.taxId, entity.email, entity.phone, entity.website, entity.addressLine_1, entity.addressLine_2, entity.city, entity.region, entity.postalCode, entity.countryCode, entity.notes, entity.status);
}
export class CreateExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateExternalPartyData) { super(); }
}
export class CreateExternalPartyResponse extends Response {
  constructor(public readonly item: ExternalPartyResponse) { super(); }
}
export class GetExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetExternalPartyResponse extends Response {
  constructor(public readonly item: ExternalPartyResponse) { super(); }
}
export class UpdateExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateExternalPartyData) { super(); }
}
export class UpdateExternalPartyResponse extends Response {
  constructor(public readonly item: ExternalPartyResponse) { super(); }
}
export class DeleteExternalPartyRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteExternalPartyResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListExternalPartiesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListExternalPartiesResponse extends Response {
  constructor(public readonly items: readonly ExternalPartyResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
