import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { Folder } from '../../domain/entities/folder.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmFolderRepository } from '../../infrastructure/persistence/repositories/typeorm-folder.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateFolderHandler } from '../../application/folders/create-folder/create-folder.handler.js';
import { GetFolderHandler } from '../../application/folders/get-folder/get-folder.handler.js';
import { UpdateFolderHandler } from '../../application/folders/update-folder/update-folder.handler.js';
import { DeleteFolderHandler } from '../../application/folders/delete-folder/delete-folder.handler.js';
import { ListFoldersHandler } from '../../application/folders/list-folders/list-folders.handler.js';
import { FoldersController } from './folders.controller.js';
const WORK = Symbol('Folders_WORK');
@Module({
  controllers: [FoldersController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Folder>> =>
        new TypeOrmUnitOfWork<CrudScope<Folder>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmFolderRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateFolderHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Folder>>): CreateFolderHandler => new CreateFolderHandler(work, systemCrudRuntime),
    },
    {
      provide: GetFolderHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Folder>>): GetFolderHandler => new GetFolderHandler(work),
    },
    {
      provide: UpdateFolderHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Folder>>): UpdateFolderHandler => new UpdateFolderHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteFolderHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Folder>>): DeleteFolderHandler => new DeleteFolderHandler(work),
    },
    {
      provide: ListFoldersHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Folder>>): ListFoldersHandler => new ListFoldersHandler(work),
    },
  ],
})
export class FoldersModule {}
