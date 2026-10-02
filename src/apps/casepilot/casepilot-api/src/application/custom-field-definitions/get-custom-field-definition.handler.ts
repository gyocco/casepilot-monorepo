import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.js';
import { GetCustomFieldDefinitionResponse, toCustomFieldDefinitionResponse, type GetCustomFieldDefinitionRequest } from './custom-field-definition.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetCustomFieldDefinitionHandler implements Handler<GetCustomFieldDefinitionRequest, GetCustomFieldDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>) {}

  async execute(request: GetCustomFieldDefinitionRequest): Promise<GetCustomFieldDefinitionResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCustomFieldDefinitionResponse(toCustomFieldDefinitionResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
