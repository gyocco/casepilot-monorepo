import { StoredEntity } from '@casepilot/abstractions';

/** CasePilot account ownership; unrelated APIs define their own scope model. */
export abstract class TenantEntity extends StoredEntity {
  businessAccountId!: string;
}
