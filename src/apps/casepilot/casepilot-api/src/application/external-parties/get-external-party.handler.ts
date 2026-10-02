import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { ExternalParty } from '../../domain/entities/external-party.js';
import { GetExternalPartyResponse, toExternalPartyResponse, type GetExternalPartyRequest } from './external-party.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetExternalPartyHandler implements Handler<GetExternalPartyRequest, GetExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<ExternalParty>>) {}

  async execute(request: GetExternalPartyRequest): Promise<GetExternalPartyResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetExternalPartyResponse(toExternalPartyResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
