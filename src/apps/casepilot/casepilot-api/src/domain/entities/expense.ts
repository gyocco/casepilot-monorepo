import { TenantEntity } from './tenant-entity.js';

export class Expense extends TenantEntity {
  caseId!: string;
  memberId!: string | null;
  description!: string;
  amount!: string;
  currency!: string;
  occurredOn!: string;
  billable!: boolean;
  invoiceLineId!: string | null;
  documentId!: string | null;
}
