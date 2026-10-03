import type { EntityManager } from 'typeorm';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { BusinessAccountRepository } from '../../../domain/repositories/business-account.repository.js';
import { business_accountTable } from '../schemas/business-account.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmBusinessAccountRepository extends TypeOrmDataRepository<BusinessAccount> implements BusinessAccountRepository {
  constructor(manager: EntityManager) { super(manager, business_accountTable); }
}
