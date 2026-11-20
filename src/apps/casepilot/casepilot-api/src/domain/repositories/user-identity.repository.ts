import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { UserIdentity } from '../entities/user-identity.js';

export interface UserIdentityRepository extends DataRepository<UserIdentity> {
  readonly entityType?: UserIdentity;
  getByProviderSubject(provider: string, subject: string): Promise<UserIdentity | null>;
}
