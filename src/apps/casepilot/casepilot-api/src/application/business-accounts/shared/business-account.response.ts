import { Response } from '@casepilot/cqrs';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { JsonValue } from '@casepilot/abstractions';

export class BusinessAccountResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly name: string,
    public readonly legalName: string | null,
    public readonly slug: string | null,
    public readonly type: string | null,
    public readonly taxId: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly website: string | null,
    public readonly timezone: string,
    public readonly locale: string,
    public readonly currency: string,
    public readonly countryCode: string,
    public readonly status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED',
    public readonly settings: JsonValue | null,
  ) { super(); }
}
export function toBusinessAccountResponse(entity: BusinessAccount): BusinessAccountResponse {
  return new BusinessAccountResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.name, entity.legalName, entity.slug, entity.type, entity.taxId, entity.email, entity.phone, entity.website, entity.timezone, entity.locale, entity.currency, entity.countryCode, entity.status, entity.settings);
}
