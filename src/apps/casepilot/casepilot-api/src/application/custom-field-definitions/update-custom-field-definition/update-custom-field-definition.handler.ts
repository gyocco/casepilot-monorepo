import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import { UpdateCustomFieldDefinitionResponse } from './update-custom-field-definition.response.js';
import { toCustomFieldDefinitionResponse } from '../shared/custom-field-definition.response.js';
import { type UpdateCustomFieldDefinitionRequest } from './update-custom-field-definition.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { custom_field_definitionFields, validateCustomFieldDefinitionRelations } from '../shared/custom-field-definition.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCustomFieldDefinitionHandler implements Handler<UpdateCustomFieldDefinitionRequest, UpdateCustomFieldDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCustomFieldDefinitionRequest): Promise<UpdateCustomFieldDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, custom_field_definitionFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new CustomFieldDefinition();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.entityType = request.data.entityType !== undefined ? request.data.entityType : existing.entityType;
      entity.caseTypeId = request.data.caseTypeId !== undefined ? request.data.caseTypeId : existing.caseTypeId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.key = request.data.key !== undefined ? request.data.key : existing.key;
      entity.dataType = request.data.dataType !== undefined ? request.data.dataType : existing.dataType;
      entity.required = request.data.required !== undefined ? request.data.required : existing.required;
      entity.configuration = request.data.configuration !== undefined ? request.data.configuration : existing.configuration;
      entity.sortOrder = request.data.sortOrder !== undefined ? request.data.sortOrder : existing.sortOrder;
      entity.isActive = request.data.isActive !== undefined ? request.data.isActive : existing.isActive;
      await validateCustomFieldDefinitionRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCustomFieldDefinitionResponse(toCustomFieldDefinitionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
