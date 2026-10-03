import type { Entity } from './entity.js';

/** Structural persistence metadata; Application assigns every value. */
export abstract class StoredEntity implements Entity<string> {
  id!: string;
  createdAt!: string;
  updatedAt!: string;
  version!: number;
}
