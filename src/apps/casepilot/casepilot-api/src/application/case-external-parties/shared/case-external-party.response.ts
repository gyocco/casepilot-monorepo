import { Response } from '@casepilot/cqrs';
import type { CaseExternalParty } from '../../../domain/entities/case-external-party.js';

export class CaseExternalPartyResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly externalPartyId: string,
    public readonly role: string,
    public readonly isPrimary: boolean,
    public readonly notes: string | null,
  ) { super(); }
}
export function toCaseExternalPartyResponse(entity: CaseExternalParty): CaseExternalPartyResponse {
  return new CaseExternalPartyResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.externalPartyId, entity.role, entity.isPrimary, entity.notes);
}
