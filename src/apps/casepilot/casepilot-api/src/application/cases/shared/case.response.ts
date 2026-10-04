import { Response } from '@casepilot/cqrs';
import type { Case } from '../../../domain/entities/case.js';

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
