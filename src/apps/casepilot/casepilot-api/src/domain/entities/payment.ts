import { TenantEntity } from './tenant-entity.js';

export class Payment extends TenantEntity {
  invoiceId!: string;
  amount!: string;
  currency!: string;
  paymentMethod!: string | null;
  reference!: string | null;
  paidAt!: string;
  notes!: string | null;
}
