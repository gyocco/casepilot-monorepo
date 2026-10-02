import { TenantEntity } from './stored-entity.js';

export class TimeEntry extends TenantEntity {
  caseId!: string;
  memberId!: string;
  taskId!: string | null;
  description!: string | null;
  startedAt!: string | null;
  endedAt!: string | null;
  durationMinutes!: number;
  billable!: boolean;
  hourlyRate!: string | null;
  currency!: string | null;
  invoiceLineId!: string | null;
}
