import { TenantEntity } from './stored-entity.js';

export class Case extends TenantEntity {
  caseTypeId!: string | null;
  number!: string | null;
  externalReference!: string | null;
  title!: string;
  description!: string | null;
  status!: string;
  priority!: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | null;
  openedAt!: string | null;
  closedAt!: string | null;
  responsibleMemberId!: string | null;
  billingType!: 'HOURLY' | 'FIXED' | 'RETAINER' | 'NON_BILLABLE' | null;
  hourlyRate!: string | null;
  currency!: string | null;
  createdByMemberId!: string;
}
