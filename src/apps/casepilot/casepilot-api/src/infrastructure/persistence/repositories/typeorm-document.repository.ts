import type { EntityManager } from 'typeorm';
import type { Document } from '../../../domain/entities/document.js';
import type { DocumentRepository } from '../../../domain/repositories/document.repository.js';
import { documentTable } from '../schemas/document.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmDocumentRepository extends TypeOrmDataRepository<Document> implements DocumentRepository {
  constructor(manager: EntityManager) { super(manager, documentTable); }
}
