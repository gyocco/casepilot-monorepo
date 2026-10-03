import { TenantEntity } from './tenant-entity.js';

export class Invoice extends TenantEntity {
  externalPartyId!: string;
  caseId!: string | null;
  number!: string;
  status!: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE';
  currency!: string;
  issueDate!: string;
  dueDate!: string | null;
  subtotal!: string;
  taxAmount!: string;
  total!: string;
  balanceDue!: string;
  notes!: string | null;
}
