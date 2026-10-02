import type { Entity } from '@casepilot/abstractions';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export abstract class StoredEntity implements Entity<string> {
  id!: string;
  createdAt!: string;
  updatedAt!: string;
  version!: number;
}

export abstract class TenantEntity extends StoredEntity {
  businessAccountId!: string;
}
