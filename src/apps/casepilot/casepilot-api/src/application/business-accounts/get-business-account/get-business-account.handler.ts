import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import { GetBusinessAccountResponse } from './get-business-account.response.js';
import { toBusinessAccountResponse } from '../shared/business-account.response.js';
import { type GetBusinessAccountRequest } from './get-business-account.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { authorizeBusinessAccountAction } from '../../shared/authorization.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetBusinessAccountHandler implements Handler<GetBusinessAccountRequest, GetBusinessAccountResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>) {}

  async execute(request: GetBusinessAccountRequest): Promise<GetBusinessAccountResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      await authorizeBusinessAccountAction(scope, request.actor, 'read', request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetBusinessAccountResponse(toBusinessAccountResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
