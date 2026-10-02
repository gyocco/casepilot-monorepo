import type { Entity, EntityId } from './models/entity.js';
import type { PageRequest } from './models/page-request.js';
import type { PageResponse } from './models/page-response.js';
import type { Repository } from './repository.js';

/** Each operation performs individual I/O; no transactions, policies or ORM options. */
export interface CrudRepository<TEntity extends Entity<TId>, TId extends EntityId = TEntity['id']> extends Repository<TEntity> {
  getAll(): Promise<readonly TEntity[]>;
  getById(id: TId): Promise<TEntity | null>;
  add(entity: TEntity): Promise<void>;
  update(entity: TEntity): Promise<boolean>;
  delete(id: TId): Promise<boolean>;
  count(): Promise<number>;
  /** Items and total must come from one read operation (BCK-009). */
  getPaged(request: PageRequest): Promise<PageResponse<TEntity>>;
}
