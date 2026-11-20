import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseMember } from '../../../domain/entities/case-member.js';
import { DeleteCaseMemberResponse } from './delete-case-member.response.js';
import { type DeleteCaseMemberRequest } from './delete-case-member.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteCaseMemberHandler implements Handler<DeleteCaseMemberRequest, DeleteCaseMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseMember>>) {}

  async execute(request: DeleteCaseMemberRequest): Promise<DeleteCaseMemberResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteCaseMemberResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
