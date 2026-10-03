import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Communication } from '../../domain/entities/communication.js';
import { GetCommunicationResponse, toCommunicationResponse, type GetCommunicationRequest } from './communication.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCommunicationHandler implements Handler<GetCommunicationRequest, GetCommunicationResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>) {}

  async execute(request: GetCommunicationRequest): Promise<GetCommunicationResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCommunicationResponse(toCommunicationResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
