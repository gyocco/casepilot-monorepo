import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import { CreateCustomFieldValueResponse, toCustomFieldValueResponse, type CreateCustomFieldValueRequest } from './custom-field-value.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { custom_field_valueFields, validateCustomFieldValueRelations } from './custom-field-value.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateCustomFieldValueHandler implements Handler<CreateCustomFieldValueRequest, CreateCustomFieldValueResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldValue>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCustomFieldValueRequest): Promise<CreateCustomFieldValueResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, custom_field_valueFields, false);
      const entity = new CustomFieldValue();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.customFieldDefinitionId = request.data.customFieldDefinitionId;
      entity.entityType = request.data.entityType;
      entity.entityId = request.data.entityId;
      entity.valueText = request.data.valueText ?? null;
      entity.valueNumber = request.data.valueNumber ?? null;
      entity.valueDate = request.data.valueDate ?? null;
      entity.valueBoolean = request.data.valueBoolean ?? null;
      entity.valueJson = request.data.valueJson ?? null;
      await validateCustomFieldValueRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCustomFieldValueResponse(toCustomFieldValueResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
