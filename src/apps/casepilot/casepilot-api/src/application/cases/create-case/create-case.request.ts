import { Request } from '@casepilot/cqrs';

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
export class CreateCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseData) { super(); }
}
