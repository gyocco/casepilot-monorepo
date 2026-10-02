import type { EntityManager } from 'typeorm';
import type { User } from '../../../domain/entities/user.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import { userTable } from '../schemas/user.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmUserRepository extends TypeOrmDataRepository<User> implements UserRepository {
  constructor(manager: EntityManager) { super(manager, userTable); }
}
