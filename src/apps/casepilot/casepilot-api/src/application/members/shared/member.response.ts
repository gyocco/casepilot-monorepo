import { Response } from '@casepilot/cqrs';
import type { Member } from '../../../domain/entities/member.js';

export class MemberResponse extends Response {
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
  ) { super(); }
}
export function toMemberResponse(entity: Member): MemberResponse {
  return new MemberResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.userId, entity.role, entity.status, entity.title, entity.professionalRegistration, entity.hourlyRate, entity.joinedAt, entity.invitedAt);
}
