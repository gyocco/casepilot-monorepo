import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CustomFieldValue } from '../../../domain/entities/custom-field-value.js';
import { UpdateCustomFieldValueResponse } from './update-custom-field-value.response.js';
import { toCustomFieldValueResponse } from '../shared/custom-field-value.response.js';
import { type UpdateCustomFieldValueRequest } from './update-custom-field-value.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { custom_field_valueFields, validateCustomFieldValueRelations } from '../shared/custom-field-value.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCustomFieldValueHandler implements Handler<UpdateCustomFieldValueRequest, UpdateCustomFieldValueResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldValue>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCustomFieldValueRequest): Promise<UpdateCustomFieldValueResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, custom_field_valueFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new CustomFieldValue();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.customFieldDefinitionId = request.data.customFieldDefinitionId !== undefined ? request.data.customFieldDefinitionId : existing.customFieldDefinitionId;
      entity.entityType = request.data.entityType !== undefined ? request.data.entityType : existing.entityType;
      entity.entityId = request.data.entityId !== undefined ? request.data.entityId : existing.entityId;
      entity.valueText = request.data.valueText !== undefined ? request.data.valueText : existing.valueText;
      entity.valueNumber = request.data.valueNumber !== undefined ? request.data.valueNumber : existing.valueNumber;
      entity.valueDate = request.data.valueDate !== undefined ? request.data.valueDate : existing.valueDate;
      entity.valueBoolean = request.data.valueBoolean !== undefined ? request.data.valueBoolean : existing.valueBoolean;
      entity.valueJson = request.data.valueJson !== undefined ? request.data.valueJson : existing.valueJson;
      await validateCustomFieldValueRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCustomFieldValueResponse(toCustomFieldValueResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
