import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Document } from '../entities/document.js';
export interface DocumentRepository extends DataRepository<Document> {
  readonly entityType?: Document;
}
