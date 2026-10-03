import type { EntityManager } from 'typeorm';
import type { CaseMember } from '../../../domain/entities/case-member.js';
import type { CaseMemberRepository } from '../../../domain/repositories/case-member.repository.js';
import { case_memberTable } from '../schemas/case-member.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmCaseMemberRepository extends TypeOrmDataRepository<CaseMember> implements CaseMemberRepository {
  constructor(manager: EntityManager) { super(manager, case_memberTable); }
}
