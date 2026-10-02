export type EntityId = string | number | bigint;

/** Data only. Implement/extend this contract explicitly; business belongs to Application. */
export interface Entity<TId extends EntityId = EntityId> {
  readonly id: TId;
}
