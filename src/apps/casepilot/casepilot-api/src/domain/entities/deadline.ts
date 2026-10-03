import { TenantEntity } from './tenant-entity.js';

export class Deadline extends TenantEntity {
  caseId!: string;
  title!: string;
  dueAt!: string;
  status!: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  responsibleMemberId!: string | null;
  completedAt!: string | null;
  notes!: string | null;
}
