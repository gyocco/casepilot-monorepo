import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Case } from '../../../domain/entities/case.js';
import { GetCaseResponse } from './get-case.response.js';
import { toCaseResponse } from '../shared/case.response.js';
import { type GetCaseRequest } from './get-case.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetCaseHandler implements Handler<GetCaseRequest, GetCaseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Case>>) {}

  async execute(request: GetCaseRequest): Promise<GetCaseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseResponse(toCaseResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
