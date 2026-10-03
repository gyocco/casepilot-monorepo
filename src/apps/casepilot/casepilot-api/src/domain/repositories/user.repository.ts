import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { User } from '../entities/user.js';
export interface UserRepository extends DataRepository<User> {
  readonly entityType?: User;
}
