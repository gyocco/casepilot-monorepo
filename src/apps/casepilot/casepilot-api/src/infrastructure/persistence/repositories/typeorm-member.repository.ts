import type { EntityManager } from 'typeorm';
import type { Member } from '../../../domain/entities/member.js';
import type { MemberRepository } from '../../../domain/repositories/member.repository.js';
import { memberTable } from '../schemas/member.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmMemberRepository extends TypeOrmDataRepository<Member> implements MemberRepository {
  constructor(manager: EntityManager) { super(manager, memberTable); }
}
