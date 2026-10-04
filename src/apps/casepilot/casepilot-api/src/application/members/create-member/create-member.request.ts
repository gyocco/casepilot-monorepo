import { Request } from '@casepilot/cqrs';

export interface CreateMemberData {
  readonly userId: string;
  readonly role: string;
  readonly status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  readonly title?: string | null;
  readonly professionalRegistration?: string | null;
  readonly hourlyRate?: string | null;
  readonly joinedAt?: string | null;
  readonly invitedAt?: string | null;
}
export class CreateMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateMemberData) { super(); }
}
