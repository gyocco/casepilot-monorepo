import type { MemberResponse } from '../../application/members/member.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class MemberHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly userId: string,
    public readonly role: string,
    public readonly status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED',
    public readonly title: string | null,
    public readonly professionalRegistration: string | null,
    public readonly hourlyRate: string | null,
    public readonly joinedAt: string | null,
    public readonly invitedAt: string | null,
  ) {}
}
export function toMemberHttpResponse(item: MemberResponse): MemberHttpResponse {
  return new MemberHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.userId, item.role, item.status, item.title, item.professionalRegistration, item.hourlyRate, item.joinedAt, item.invitedAt);
}
export class MemberItemHttpResponse {
  constructor(public readonly item: MemberHttpResponse) {}
}
export class MembersPageHttpResponse {
  constructor(public readonly items: readonly MemberHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteMemberHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
