import type { PageRequest, Repository } from '@casepilot/abstractions';
import type { StoredEntity } from '../entities/stored-entity.js';

export interface DataRepository<TEntity extends StoredEntity> extends Repository<TEntity> {
  getById(id: string, businessAccountId: string | null): Promise<TEntity | null>;
  getPage(page: PageRequest, businessAccountId: string | null): Promise<readonly TEntity[]>;
  count(businessAccountId: string | null): Promise<number>;
  add(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity, businessAccountId: string | null, expectedVersion: number): Promise<TEntity | null>;
  delete(id: string, businessAccountId: string | null, expectedVersion: number): Promise<boolean>;
}
