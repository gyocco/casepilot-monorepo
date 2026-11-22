import type { EntitySchema } from 'typeorm';
import type { StoredEntity } from '@casepilot/abstractions';

export interface SqlColumn<TEntity extends StoredEntity> {
  readonly property: string;
  readonly name: string;
  readonly json?: boolean;
  readonly value: (entity: TEntity) => unknown;
}
export interface SqlTable<TEntity extends StoredEntity> {
  readonly schema: EntitySchema<TEntity>;
  readonly tableName: string;
  readonly scopeColumn: string | null;
  readonly idColumn: string;
  readonly versionColumn: string;
  readonly immutableColumns: readonly string[];
  readonly columns: readonly SqlColumn<TEntity>[];
  readonly read: (row: Record<string, unknown>) => TEntity;
}
