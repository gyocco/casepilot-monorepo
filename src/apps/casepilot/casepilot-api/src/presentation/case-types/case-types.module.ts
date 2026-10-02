import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { CaseType } from '../../domain/entities/case-type.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmCaseTypeRepository } from '../../infrastructure/persistence/repositories/typeorm-case-type.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateCaseTypeHandler } from '../../application/case-types/create-case-type.handler.js';
import { GetCaseTypeHandler } from '../../application/case-types/get-case-type.handler.js';
import { UpdateCaseTypeHandler } from '../../application/case-types/update-case-type.handler.js';
import { DeleteCaseTypeHandler } from '../../application/case-types/delete-case-type.handler.js';
import { ListCaseTypesHandler } from '../../application/case-types/list-case-types.handler.js';
import { CaseTypesController } from './case-types.controller.js';
const WORK = Symbol('CaseTypes_WORK');
@Module({
  controllers: [CaseTypesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<CaseType>> =>
        new TypeOrmUnitOfWork<CrudScope<CaseType>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCaseTypeRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCaseTypeHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseType>>): CreateCaseTypeHandler => new CreateCaseTypeHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCaseTypeHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseType>>): GetCaseTypeHandler => new GetCaseTypeHandler(work),
    },
    {
      provide: UpdateCaseTypeHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseType>>): UpdateCaseTypeHandler => new UpdateCaseTypeHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCaseTypeHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseType>>): DeleteCaseTypeHandler => new DeleteCaseTypeHandler(work),
    },
    {
      provide: ListCaseTypesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseType>>): ListCaseTypesHandler => new ListCaseTypesHandler(work),
    },
  ],
})
export class CaseTypesModule {}
