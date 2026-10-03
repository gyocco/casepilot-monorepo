import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { DocumentVersion } from '../entities/document-version.js';
export interface DocumentVersionRepository extends DataRepository<DocumentVersion> {
  readonly entityType?: DocumentVersion;
}
