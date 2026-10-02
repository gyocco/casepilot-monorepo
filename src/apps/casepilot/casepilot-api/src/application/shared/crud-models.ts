import { Response } from '@casepilot/cqrs';
import type { DataRepository } from '../../domain/repositories/data.repository.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { StoredEntity } from '../../domain/entities/stored-entity.js';
export type { JsonValue } from '../../domain/entities/stored-entity.js';

export interface CrudScope<TEntity extends StoredEntity> {
  readonly resource: DataRepository<TEntity>;
  readonly references: ReferenceRepository;
}

export interface CrudRuntime {
  newId(): string;
  now(): string;
}

export class PageMetadataResponse extends Response {
  constructor(
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly totalCount: number,
    public readonly totalPages: number,
    public readonly hasNextPage: boolean,
    public readonly hasPreviousPage: boolean,
  ) { super(); }
}
