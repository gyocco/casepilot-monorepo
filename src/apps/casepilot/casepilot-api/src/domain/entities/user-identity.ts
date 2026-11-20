import { StoredEntity } from '@casepilot/abstractions';

export class UserIdentity extends StoredEntity {
  userId!: string;
  provider!: string;
  subject!: string;
}
