import type { CaseMemberResponse } from '../../application/case-members/case-member.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class CaseMemberHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly memberId: string,
    public readonly role: string | null,
    public readonly isPrimary: boolean,
    public readonly assignedAt: string,
    public readonly removedAt: string | null,
  ) {}
}
export function toCaseMemberHttpResponse(item: CaseMemberResponse): CaseMemberHttpResponse {
  return new CaseMemberHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.memberId, item.role, item.isPrimary, item.assignedAt, item.removedAt);
}
export class CaseMemberItemHttpResponse {
  constructor(public readonly item: CaseMemberHttpResponse) {}
}
export class CaseMembersPageHttpResponse {
  constructor(public readonly items: readonly CaseMemberHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCaseMemberHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
