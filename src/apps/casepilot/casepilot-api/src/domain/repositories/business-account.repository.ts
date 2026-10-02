import type { DataRepository } from './data.repository.js';
import type { BusinessAccount } from '../entities/business-account.js';
export interface BusinessAccountRepository extends DataRepository<BusinessAccount> {
  readonly entityType?: BusinessAccount;
}
