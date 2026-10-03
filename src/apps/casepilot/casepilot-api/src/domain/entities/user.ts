import { StoredEntity } from '@casepilot/abstractions';

export class User extends StoredEntity {
  email!: string;
  emailVerifiedAt!: string | null;
  firstName!: string;
  lastName!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  locale!: string | null;
  timezone!: string | null;
  status!: string;
  lastLoginAt!: string | null;
}
