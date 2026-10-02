import { TenantEntity } from './stored-entity.js';

export class Note extends TenantEntity {
  caseId!: string | null;
  externalPartyId!: string | null;
  authorMemberId!: string;
  title!: string | null;
  body!: string;
  isPrivate!: boolean;
}
