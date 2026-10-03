import type { Repository } from './repository.js';
import type { StoredEntity } from './models/stored-entity.js';
import type { PageRequest } from './models/page-request.js';

/** A null scope selects an explicitly global table; each method is one I/O. */
export interface ScopedDataRepository<TEntity extends StoredEntity> extends Repository<TEntity> {
  getById(id: string, scope: string | null): Promise<TEntity | null>;
  getPage(page: PageRequest, scope: string | null): Promise<readonly TEntity[]>;
  count(scope: string | null): Promise<number>;
  add(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity, scope: string | null, expectedVersion: number): Promise<TEntity | null>;
  delete(id: string, scope: string | null, expectedVersion: number): Promise<boolean>;
}
