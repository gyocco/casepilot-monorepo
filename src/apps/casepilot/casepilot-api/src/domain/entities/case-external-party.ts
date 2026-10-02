import { TenantEntity } from './stored-entity.js';

export class CaseExternalParty extends TenantEntity {
  caseId!: string;
  externalPartyId!: string;
  role!: string;
  isPrimary!: boolean;
  notes!: string | null;
}
