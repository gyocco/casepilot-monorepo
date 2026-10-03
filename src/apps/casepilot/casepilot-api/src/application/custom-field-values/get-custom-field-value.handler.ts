import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import { GetCustomFieldValueResponse, toCustomFieldValueResponse, type GetCustomFieldValueRequest } from './custom-field-value.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCustomFieldValueHandler implements Handler<GetCustomFieldValueRequest, GetCustomFieldValueResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldValue>>) {}

  async execute(request: GetCustomFieldValueRequest): Promise<GetCustomFieldValueResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCustomFieldValueResponse(toCustomFieldValueResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
