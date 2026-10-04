import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseType } from '../../../domain/entities/case-type.js';
import { GetCaseTypeResponse } from './get-case-type.response.js';
import { toCaseTypeResponse } from '../shared/case-type.response.js';
import { type GetCaseTypeRequest } from './get-case-type.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCaseTypeHandler implements Handler<GetCaseTypeRequest, GetCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>) {}

  async execute(request: GetCaseTypeRequest): Promise<GetCaseTypeResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseTypeResponse(toCaseTypeResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
