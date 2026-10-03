import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Member } from '../entities/member.js';
export interface MemberRepository extends DataRepository<Member> {
  readonly entityType?: Member;
}
