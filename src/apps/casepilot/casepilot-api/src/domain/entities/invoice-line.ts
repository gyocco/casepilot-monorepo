import { TenantEntity } from './stored-entity.js';

export class InvoiceLine extends TenantEntity {
  invoiceId!: string;
  caseId!: string | null;
  description!: string;
  quantity!: string;
  unitPrice!: string;
  taxRate!: string | null;
  subtotal!: string;
  total!: string;
  sortOrder!: number;
}
