import { Request, Response } from '@casepilot/cqrs';
import type { BusinessAccount } from '../../domain/entities/business-account.js';
import type { JsonValue } from '@casepilot/abstractions';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateBusinessAccountData {
  readonly name: string;
  readonly legalName?: string | null;
  readonly slug?: string | null;
  readonly type?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly timezone: string;
  readonly locale: string;
  readonly currency: string;
  readonly countryCode: string;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  readonly settings?: JsonValue | null;
}
export interface UpdateBusinessAccountData {
  readonly name?: string;
  readonly legalName?: string | null;
  readonly slug?: string | null;
  readonly type?: string | null;
  readonly taxId?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly timezone?: string;
  readonly locale?: string;
  readonly currency?: string;
  readonly countryCode?: string;
  readonly status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  readonly settings?: JsonValue | null;
}
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
export class CreateBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateBusinessAccountData) { super(); }
}
export class CreateBusinessAccountResponse extends Response {
  constructor(public readonly item: BusinessAccountResponse) { super(); }
}
export class GetBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetBusinessAccountResponse extends Response {
  constructor(public readonly item: BusinessAccountResponse) { super(); }
}
export class UpdateBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateBusinessAccountData) { super(); }
}
export class UpdateBusinessAccountResponse extends Response {
  constructor(public readonly item: BusinessAccountResponse) { super(); }
}
export class DeleteBusinessAccountRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteBusinessAccountResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListBusinessAccountsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListBusinessAccountsResponse extends Response {
  constructor(public readonly items: readonly BusinessAccountResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
