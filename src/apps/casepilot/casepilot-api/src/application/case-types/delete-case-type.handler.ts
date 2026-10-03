import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseType } from '../../domain/entities/case-type.js';
import { DeleteCaseTypeResponse, type DeleteCaseTypeRequest } from './case-type.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteCaseTypeHandler implements Handler<DeleteCaseTypeRequest, DeleteCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>) {}

  async execute(request: DeleteCaseTypeRequest): Promise<DeleteCaseTypeResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteCaseTypeResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
