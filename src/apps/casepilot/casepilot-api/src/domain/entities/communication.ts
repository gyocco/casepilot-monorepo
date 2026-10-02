import { TenantEntity } from './stored-entity.js';

export class Communication extends TenantEntity {
  caseId!: string | null;
  externalPartyId!: string | null;
  memberId!: string | null;
  type!: 'EMAIL' | 'PHONE' | 'MEETING' | 'MESSAGE' | 'LETTER';
  direction!: 'INBOUND' | 'OUTBOUND' | null;
  subject!: string | null;
  body!: string | null;
  occurredAt!: string;
  externalReference!: string | null;
}
