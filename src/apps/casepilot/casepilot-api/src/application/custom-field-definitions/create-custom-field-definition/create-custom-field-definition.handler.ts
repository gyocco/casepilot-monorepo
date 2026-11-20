import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import { CreateCustomFieldDefinitionResponse } from './create-custom-field-definition.response.js';
import { toCustomFieldDefinitionResponse } from '../shared/custom-field-definition.response.js';
import { type CreateCustomFieldDefinitionRequest } from './create-custom-field-definition.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { custom_field_definitionFields, validateCustomFieldDefinitionRelations } from '../shared/custom-field-definition.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateCustomFieldDefinitionHandler implements Handler<CreateCustomFieldDefinitionRequest, CreateCustomFieldDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCustomFieldDefinitionRequest): Promise<CreateCustomFieldDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, custom_field_definitionFields, false);
      const entity = new CustomFieldDefinition();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.entityType = request.data.entityType;
      entity.caseTypeId = request.data.caseTypeId ?? null;
      entity.name = request.data.name;
      entity.key = request.data.key;
      entity.dataType = request.data.dataType;
      entity.required = request.data.required;
      entity.configuration = request.data.configuration ?? null;
      entity.sortOrder = request.data.sortOrder;
      entity.isActive = request.data.isActive;
      await validateCustomFieldDefinitionRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCustomFieldDefinitionResponse(toCustomFieldDefinitionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
