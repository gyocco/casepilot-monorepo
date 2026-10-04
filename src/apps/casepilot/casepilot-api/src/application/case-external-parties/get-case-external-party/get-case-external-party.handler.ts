import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseExternalParty } from '../../../domain/entities/case-external-party.js';
import { GetCaseExternalPartyResponse } from './get-case-external-party.response.js';
import { toCaseExternalPartyResponse } from '../shared/case-external-party.response.js';
import { type GetCaseExternalPartyRequest } from './get-case-external-party.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCaseExternalPartyHandler implements Handler<GetCaseExternalPartyRequest, GetCaseExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseExternalParty>>) {}

  async execute(request: GetCaseExternalPartyRequest): Promise<GetCaseExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseExternalPartyResponse(toCaseExternalPartyResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
