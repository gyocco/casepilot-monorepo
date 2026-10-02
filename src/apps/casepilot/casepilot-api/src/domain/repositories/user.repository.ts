import type { DataRepository } from './data.repository.js';
import type { User } from '../entities/user.js';
export interface UserRepository extends DataRepository<User> {
  readonly entityType?: User;
}
