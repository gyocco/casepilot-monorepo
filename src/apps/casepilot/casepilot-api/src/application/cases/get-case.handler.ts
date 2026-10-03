import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Case } from '../../domain/entities/case.js';
import { GetCaseResponse, toCaseResponse, type GetCaseRequest } from './case.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCaseHandler implements Handler<GetCaseRequest, GetCaseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Case>>) {}

  async execute(request: GetCaseRequest): Promise<GetCaseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseResponse(toCaseResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
