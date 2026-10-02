import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { StatusDefinition } from '../../domain/entities/status-definition.js';
import { GetStatusDefinitionResponse, toStatusDefinitionResponse, type GetStatusDefinitionRequest } from './status-definition.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetStatusDefinitionHandler implements Handler<GetStatusDefinitionRequest, GetStatusDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<StatusDefinition>>) {}

  async execute(request: GetStatusDefinitionRequest): Promise<GetStatusDefinitionResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetStatusDefinitionResponse(toStatusDefinitionResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
