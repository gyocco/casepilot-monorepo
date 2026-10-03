import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { CaseMember } from '../entities/case-member.js';
export interface CaseMemberRepository extends DataRepository<CaseMember> {
  readonly entityType?: CaseMember;
}
