import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import { GetCustomFieldDefinitionResponse } from './get-custom-field-definition.response.js';
import { toCustomFieldDefinitionResponse } from '../shared/custom-field-definition.response.js';
import { type GetCustomFieldDefinitionRequest } from './get-custom-field-definition.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetCustomFieldDefinitionHandler implements Handler<GetCustomFieldDefinitionRequest, GetCustomFieldDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>) {}

  async execute(request: GetCustomFieldDefinitionRequest): Promise<GetCustomFieldDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCustomFieldDefinitionResponse(toCustomFieldDefinitionResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
