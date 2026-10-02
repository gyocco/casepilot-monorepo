import type { DataRepository } from './data.repository.js';
import type { Document } from '../entities/document.js';
export interface DocumentRepository extends DataRepository<Document> {
  readonly entityType?: Document;
}
