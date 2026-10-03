import { Request, Response } from '@casepilot/cqrs';
import type { Case } from '../../domain/entities/case.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateCaseData {
  readonly caseTypeId?: string | null;
  readonly number?: string | null;
  readonly externalReference?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly status: string;
  readonly priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | null;
  readonly openedAt?: string | null;
  readonly closedAt?: string | null;
  readonly responsibleMemberId?: string | null;
  readonly billingType?: 'HOURLY' | 'FIXED' | 'RETAINER' | 'NON_BILLABLE' | null;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly createdByMemberId: string;
}
export interface UpdateCaseData {
  readonly caseTypeId?: string | null;
  readonly number?: string | null;
  readonly externalReference?: string | null;
  readonly title?: string;
  readonly description?: string | null;
  readonly status?: string;
  readonly priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | null;
  readonly openedAt?: string | null;
  readonly closedAt?: string | null;
  readonly responsibleMemberId?: string | null;
  readonly billingType?: 'HOURLY' | 'FIXED' | 'RETAINER' | 'NON_BILLABLE' | null;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly createdByMemberId?: string;
}
export class CaseResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseTypeId: string | null,
    public readonly number: string | null,
    public readonly externalReference: string | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | null,
    public readonly openedAt: string | null,
    public readonly closedAt: string | null,
    public readonly responsibleMemberId: string | null,
    public readonly billingType: 'HOURLY' | 'FIXED' | 'RETAINER' | 'NON_BILLABLE' | null,
    public readonly hourlyRate: string | null,
    public readonly currency: string | null,
    public readonly createdByMemberId: string,
  ) { super(); }
}
export function toCaseResponse(entity: Case): CaseResponse {
  return new CaseResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseTypeId, entity.number, entity.externalReference, entity.title, entity.description, entity.status, entity.priority, entity.openedAt, entity.closedAt, entity.responsibleMemberId, entity.billingType, entity.hourlyRate, entity.currency, entity.createdByMemberId);
}
export class CreateCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseData) { super(); }
}
export class CreateCaseResponse extends Response {
  constructor(public readonly item: CaseResponse) { super(); }
}
export class GetCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCaseResponse extends Response {
  constructor(public readonly item: CaseResponse) { super(); }
}
export class UpdateCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseData) { super(); }
}
export class UpdateCaseResponse extends Response {
  constructor(public readonly item: CaseResponse) { super(); }
}
export class DeleteCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCaseResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCasesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCasesResponse extends Response {
  constructor(public readonly items: readonly CaseResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
