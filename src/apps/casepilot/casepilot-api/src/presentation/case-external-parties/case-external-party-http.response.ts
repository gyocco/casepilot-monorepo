import type { CaseExternalPartyResponse } from '../../application/case-external-parties/case-external-party.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class CaseExternalPartyHttpResponse {
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
  ) {}
}
export function toCaseExternalPartyHttpResponse(item: CaseExternalPartyResponse): CaseExternalPartyHttpResponse {
  return new CaseExternalPartyHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.externalPartyId, item.role, item.isPrimary, item.notes);
}
export class CaseExternalPartyItemHttpResponse {
  constructor(public readonly item: CaseExternalPartyHttpResponse) {}
}
export class CaseExternalPartiesPageHttpResponse {
  constructor(public readonly items: readonly CaseExternalPartyHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCaseExternalPartyHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
