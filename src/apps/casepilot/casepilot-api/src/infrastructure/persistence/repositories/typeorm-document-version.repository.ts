import type { EntityManager } from 'typeorm';
import type { DocumentVersion } from '../../../domain/entities/document-version.js';
import type { DocumentVersionRepository } from '../../../domain/repositories/document-version.repository.js';
import { document_versionTable } from '../schemas/document-version.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmDocumentVersionRepository extends TypeOrmDataRepository<DocumentVersion> implements DocumentVersionRepository {
  constructor(manager: EntityManager) { super(manager, document_versionTable); }
}
