import type { CaseResponse } from '../../application/cases/shared/case.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class CaseHttpResponse {
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
  ) {}
}
export function toCaseHttpResponse(item: CaseResponse): CaseHttpResponse {
  return new CaseHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseTypeId, item.number, item.externalReference, item.title, item.description, item.status, item.priority, item.openedAt, item.closedAt, item.responsibleMemberId, item.billingType, item.hourlyRate, item.currency, item.createdByMemberId);
}
export class CaseItemHttpResponse {
  constructor(public readonly item: CaseHttpResponse) {}
}
export class CasesPageHttpResponse {
  constructor(public readonly items: readonly CaseHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCaseHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
