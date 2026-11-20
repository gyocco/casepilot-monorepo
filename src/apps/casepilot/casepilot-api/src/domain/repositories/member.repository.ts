import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Member } from '../entities/member.js';

export interface MemberRepository extends DataRepository<Member> {
  readonly entityType?: Member;
  getByUserAndAccount(userId: string, businessAccountId: string): Promise<Member | null>;
  listByUser(userId: string): Promise<readonly Member[]>;
}
