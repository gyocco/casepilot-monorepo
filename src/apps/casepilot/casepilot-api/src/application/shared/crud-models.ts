import type { StoredEntity } from '@casepilot/abstractions';
import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';

/** Product-specific repository set; Application coordinates their operations. */
export interface CrudScope<TEntity extends StoredEntity> {
  readonly resource: DataRepository<TEntity>;
  readonly references: ReferenceRepository;
}
