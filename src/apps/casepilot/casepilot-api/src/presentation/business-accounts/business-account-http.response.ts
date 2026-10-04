import type { BusinessAccountResponse } from '../../application/business-accounts/shared/business-account.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import type { JsonValue } from '@casepilot/abstractions';
export class BusinessAccountHttpResponse {
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
  ) {}
}
export function toBusinessAccountHttpResponse(item: BusinessAccountResponse): BusinessAccountHttpResponse {
  return new BusinessAccountHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.name, item.legalName, item.slug, item.type, item.taxId, item.email, item.phone, item.website, item.timezone, item.locale, item.currency, item.countryCode, item.status, item.settings);
}
export class BusinessAccountItemHttpResponse {
  constructor(public readonly item: BusinessAccountHttpResponse) {}
}
export class BusinessAccountsPageHttpResponse {
  constructor(public readonly items: readonly BusinessAccountHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteBusinessAccountHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
