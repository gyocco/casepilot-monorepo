import type { Entity } from './models/entity.js';

/** Typed repository marker; specialized contracts declare their own operations. */
export interface Repository<TEntity extends Entity = Entity> {
  /** Optional phantom member carries the entity type without requiring runtime state. */
  readonly entityType?: TEntity;
}
