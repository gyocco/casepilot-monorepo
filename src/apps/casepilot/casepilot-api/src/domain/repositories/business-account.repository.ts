import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { BusinessAccount } from '../entities/business-account.js';
export interface BusinessAccountRepository extends DataRepository<BusinessAccount> {
  readonly entityType?: BusinessAccount;
}
