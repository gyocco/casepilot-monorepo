import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { BusinessAccount } from '../../domain/entities/business-account.js';
import { GetBusinessAccountResponse, toBusinessAccountResponse, type GetBusinessAccountRequest } from './business-account.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetBusinessAccountHandler implements Handler<GetBusinessAccountRequest, GetBusinessAccountResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>) {}

  async execute(request: GetBusinessAccountRequest): Promise<GetBusinessAccountResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetBusinessAccountResponse(toBusinessAccountResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
