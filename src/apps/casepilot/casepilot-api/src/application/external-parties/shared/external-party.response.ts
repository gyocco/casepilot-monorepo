import { Response } from '@casepilot/cqrs';
import type { ExternalParty } from '../../../domain/entities/external-party.js';

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
