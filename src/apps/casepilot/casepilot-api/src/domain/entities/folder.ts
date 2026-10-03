import { TenantEntity } from './tenant-entity.js';

export class Folder extends TenantEntity {
  caseId!: string | null;
  parentFolderId!: string | null;
  name!: string;
  createdByMemberId!: string;
}
