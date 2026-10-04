import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmCustomFieldValueRepository } from '../../infrastructure/persistence/repositories/typeorm-custom-field-value.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCustomFieldValueHandler } from '../../application/custom-field-values/create-custom-field-value/create-custom-field-value.handler.js';
import { GetCustomFieldValueHandler } from '../../application/custom-field-values/get-custom-field-value/get-custom-field-value.handler.js';
import { UpdateCustomFieldValueHandler } from '../../application/custom-field-values/update-custom-field-value/update-custom-field-value.handler.js';
import { DeleteCustomFieldValueHandler } from '../../application/custom-field-values/delete-custom-field-value/delete-custom-field-value.handler.js';
import { ListCustomFieldValuesHandler } from '../../application/custom-field-values/list-custom-field-values/list-custom-field-values.handler.js';
import { CustomFieldValuesController } from './custom-field-values.controller.js';
const WORK = Symbol('CustomFieldValues_WORK');
@Module({
  controllers: [CustomFieldValuesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<CustomFieldValue>> =>
        new TypeOrmUnitOfWork<CrudScope<CustomFieldValue>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCustomFieldValueRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCustomFieldValueHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldValue>>): CreateCustomFieldValueHandler => new CreateCustomFieldValueHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCustomFieldValueHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldValue>>): GetCustomFieldValueHandler => new GetCustomFieldValueHandler(work),
    },
    {
      provide: UpdateCustomFieldValueHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldValue>>): UpdateCustomFieldValueHandler => new UpdateCustomFieldValueHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCustomFieldValueHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldValue>>): DeleteCustomFieldValueHandler => new DeleteCustomFieldValueHandler(work),
    },
    {
      provide: ListCustomFieldValuesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldValue>>): ListCustomFieldValuesHandler => new ListCustomFieldValuesHandler(work),
    },
  ],
})
export class CustomFieldValuesModule {}
