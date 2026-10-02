import type { Repository } from '@casepilot/abstractions';
import type { ResourceKind } from '../entities/resource-kind.js';
import type { ReferenceRecord } from '../entities/reference-record.js';
export interface ReferenceRepository extends Repository<ReferenceRecord> {
  find(kind: ResourceKind, id: string, businessAccountId: string | null): Promise<ReferenceRecord | null>;
}
