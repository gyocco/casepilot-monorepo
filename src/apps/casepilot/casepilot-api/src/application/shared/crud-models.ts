import type { StoredEntity } from '@casepilot/abstractions';
import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { MemberRepository } from '../../domain/repositories/member.repository.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { UserIdentityRepository } from '../../domain/repositories/user-identity.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

/** Repository contracts required by Application to verify actor identity and account membership. */
export interface AuthorizationScope {
  readonly users: UserRepository;
  readonly userIdentities: UserIdentityRepository;
  readonly members: MemberRepository;
}

/** Product-specific repository set; Application coordinates their operations. */
export interface CrudScope<TEntity extends StoredEntity> extends AuthorizationScope {
  readonly resource: DataRepository<TEntity>;
  readonly references: ReferenceRepository;
}
