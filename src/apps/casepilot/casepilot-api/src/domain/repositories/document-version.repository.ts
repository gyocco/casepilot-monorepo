import type { DataRepository } from './data.repository.js';
import type { DocumentVersion } from '../entities/document-version.js';
export interface DocumentVersionRepository extends DataRepository<DocumentVersion> {
  readonly entityType?: DocumentVersion;
}
