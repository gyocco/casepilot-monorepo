import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmCustomFieldDefinitionRepository } from '../../infrastructure/persistence/repositories/typeorm-custom-field-definition.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/create-custom-field-definition/create-custom-field-definition.handler.js';
import { GetCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/get-custom-field-definition/get-custom-field-definition.handler.js';
import { UpdateCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/update-custom-field-definition/update-custom-field-definition.handler.js';
import { DeleteCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/delete-custom-field-definition/delete-custom-field-definition.handler.js';
import { ListCustomFieldDefinitionsHandler } from '../../application/custom-field-definitions/list-custom-field-definitions/list-custom-field-definitions.handler.js';
import { CustomFieldDefinitionsController } from './custom-field-definitions.controller.js';
const WORK = Symbol('CustomFieldDefinitions_WORK');
@Module({
  controllers: [CustomFieldDefinitionsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<CustomFieldDefinition>> =>
        new TypeOrmUnitOfWork<CrudScope<CustomFieldDefinition>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCustomFieldDefinitionRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateCustomFieldDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldDefinition>>): CreateCustomFieldDefinitionHandler => new CreateCustomFieldDefinitionHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCustomFieldDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldDefinition>>): GetCustomFieldDefinitionHandler => new GetCustomFieldDefinitionHandler(work),
    },
    {
      provide: UpdateCustomFieldDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldDefinition>>): UpdateCustomFieldDefinitionHandler => new UpdateCustomFieldDefinitionHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCustomFieldDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldDefinition>>): DeleteCustomFieldDefinitionHandler => new DeleteCustomFieldDefinitionHandler(work),
    },
    {
      provide: ListCustomFieldDefinitionsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CustomFieldDefinition>>): ListCustomFieldDefinitionsHandler => new ListCustomFieldDefinitionsHandler(work),
    },
  ],
})
export class CustomFieldDefinitionsModule {}
