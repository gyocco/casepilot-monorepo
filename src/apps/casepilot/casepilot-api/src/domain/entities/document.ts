import { TenantEntity } from './stored-entity.js';

export class Document extends TenantEntity {
  caseId!: string | null;
  externalPartyId!: string | null;
  folderId!: string | null;
  name!: string;
  description!: string | null;
  documentType!: string | null;
  currentVersionId!: string | null;
  createdByMemberId!: string;
}
