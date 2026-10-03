import { TenantEntity } from './tenant-entity.js';

export class CaseMember extends TenantEntity {
  caseId!: string;
  memberId!: string;
  role!: string | null;
  isPrimary!: boolean;
  assignedAt!: string;
  removedAt!: string | null;
}
