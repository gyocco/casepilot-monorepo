import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Document } from '../../domain/entities/document.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmDocumentRepository } from '../../infrastructure/persistence/repositories/typeorm-document.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateDocumentHandler } from '../../application/documents/create-document.handler.js';
import { GetDocumentHandler } from '../../application/documents/get-document.handler.js';
import { UpdateDocumentHandler } from '../../application/documents/update-document.handler.js';
import { DeleteDocumentHandler } from '../../application/documents/delete-document.handler.js';
import { ListDocumentsHandler } from '../../application/documents/list-documents.handler.js';
import { DocumentsController } from './documents.controller.js';
const WORK = Symbol('Documents_WORK');
@Module({
  controllers: [DocumentsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Document>> =>
        new TypeOrmUnitOfWork<CrudScope<Document>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmDocumentRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateDocumentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Document>>): CreateDocumentHandler => new CreateDocumentHandler(work, systemCrudRuntime),
    },
    {
      provide: GetDocumentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Document>>): GetDocumentHandler => new GetDocumentHandler(work),
    },
    {
      provide: UpdateDocumentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Document>>): UpdateDocumentHandler => new UpdateDocumentHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteDocumentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Document>>): DeleteDocumentHandler => new DeleteDocumentHandler(work),
    },
    {
      provide: ListDocumentsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Document>>): ListDocumentsHandler => new ListDocumentsHandler(work),
    },
  ],
})
export class DocumentsModule {}
