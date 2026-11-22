import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { DocumentVersion } from '../../domain/entities/document-version.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmDocumentVersionRepository } from '../../infrastructure/persistence/repositories/typeorm-document-version.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateDocumentVersionHandler } from '../../application/document-versions/create-document-version/create-document-version.handler.js';
import { GetDocumentVersionHandler } from '../../application/document-versions/get-document-version/get-document-version.handler.js';
import { UpdateDocumentVersionHandler } from '../../application/document-versions/update-document-version/update-document-version.handler.js';
import { DeleteDocumentVersionHandler } from '../../application/document-versions/delete-document-version/delete-document-version.handler.js';
import { ListDocumentVersionsHandler } from '../../application/document-versions/list-document-versions/list-document-versions.handler.js';
import { DocumentVersionsController } from './document-versions.controller.js';
const WORK = Symbol('DocumentVersions_WORK');
@Module({
  controllers: [DocumentVersionsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<DocumentVersion>> =>
        new TypeOrmUnitOfWork<CrudScope<DocumentVersion>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmDocumentVersionRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateDocumentVersionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<DocumentVersion>>): CreateDocumentVersionHandler => new CreateDocumentVersionHandler(work, systemCrudRuntime),
    },
    {
      provide: GetDocumentVersionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<DocumentVersion>>): GetDocumentVersionHandler => new GetDocumentVersionHandler(work),
    },
    {
      provide: UpdateDocumentVersionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<DocumentVersion>>): UpdateDocumentVersionHandler => new UpdateDocumentVersionHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteDocumentVersionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<DocumentVersion>>): DeleteDocumentVersionHandler => new DeleteDocumentVersionHandler(work),
    },
    {
      provide: ListDocumentVersionsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<DocumentVersion>>): ListDocumentVersionsHandler => new ListDocumentVersionsHandler(work),
    },
  ],
})
export class DocumentVersionsModule {}
