import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

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
export class UpdateCaseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseData, public readonly actor: VerifiedIdentity) { super(); }
}
