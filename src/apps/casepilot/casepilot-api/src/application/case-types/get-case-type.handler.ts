import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseType } from '../../domain/entities/case-type.js';
import { GetCaseTypeResponse, toCaseTypeResponse, type GetCaseTypeRequest } from './case-type.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetCaseTypeHandler implements Handler<GetCaseTypeRequest, GetCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>) {}

  async execute(request: GetCaseTypeRequest): Promise<GetCaseTypeResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseTypeResponse(toCaseTypeResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
