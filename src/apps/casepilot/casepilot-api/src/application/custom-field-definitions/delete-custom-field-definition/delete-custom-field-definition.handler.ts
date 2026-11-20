import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import { DeleteCustomFieldDefinitionResponse } from './delete-custom-field-definition.response.js';
import { type DeleteCustomFieldDefinitionRequest } from './delete-custom-field-definition.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteCustomFieldDefinitionHandler implements Handler<DeleteCustomFieldDefinitionRequest, DeleteCustomFieldDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>) {}

  async execute(request: DeleteCustomFieldDefinitionRequest): Promise<DeleteCustomFieldDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteCustomFieldDefinitionResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
