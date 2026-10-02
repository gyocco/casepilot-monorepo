import type { DataRepository } from './data.repository.js';
import type { Member } from '../entities/member.js';
export interface MemberRepository extends DataRepository<Member> {
  readonly entityType?: Member;
}
