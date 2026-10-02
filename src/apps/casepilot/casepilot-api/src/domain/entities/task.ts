import { TenantEntity } from './stored-entity.js';

export class Task extends TenantEntity {
  caseId!: string | null;
  title!: string;
  description!: string | null;
  status!: string;
  priority!: string | null;
  assignedMemberId!: string | null;
  createdByMemberId!: string;
  dueAt!: string | null;
  completedAt!: string | null;
}
