import type { DataRepository } from './data.repository.js';
import type { CaseMember } from '../entities/case-member.js';
export interface CaseMemberRepository extends DataRepository<CaseMember> {
  readonly entityType?: CaseMember;
}
