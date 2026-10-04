import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { ExternalParty } from '../../../domain/entities/external-party.js';
import { GetExternalPartyResponse } from './get-external-party.response.js';
import { toExternalPartyResponse } from '../shared/external-party.response.js';
import { type GetExternalPartyRequest } from './get-external-party.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetExternalPartyHandler implements Handler<GetExternalPartyRequest, GetExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<ExternalParty>>) {}

  async execute(request: GetExternalPartyRequest): Promise<GetExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetExternalPartyResponse(toExternalPartyResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
