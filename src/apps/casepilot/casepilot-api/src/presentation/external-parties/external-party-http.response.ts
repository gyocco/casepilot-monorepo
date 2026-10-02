import type { ExternalPartyResponse } from '../../application/external-parties/external-party.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class ExternalPartyHttpResponse {
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
  ) {}
}
export function toExternalPartyHttpResponse(item: ExternalPartyResponse): ExternalPartyHttpResponse {
  return new ExternalPartyHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.type, item.displayName, item.firstName, item.lastName, item.legalName, item.taxId, item.email, item.phone, item.website, item.addressLine_1, item.addressLine_2, item.city, item.region, item.postalCode, item.countryCode, item.notes, item.status);
}
export class ExternalPartyItemHttpResponse {
  constructor(public readonly item: ExternalPartyHttpResponse) {}
}
export class ExternalPartiesPageHttpResponse {
  constructor(public readonly items: readonly ExternalPartyHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteExternalPartyHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
