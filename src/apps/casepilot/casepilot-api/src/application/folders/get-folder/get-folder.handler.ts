import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Folder } from '../../../domain/entities/folder.js';
import { GetFolderResponse } from './get-folder.response.js';
import { toFolderResponse } from '../shared/folder.response.js';
import { type GetFolderRequest } from './get-folder.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetFolderHandler implements Handler<GetFolderRequest, GetFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>) {}

  async execute(request: GetFolderRequest): Promise<GetFolderResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetFolderResponse(toFolderResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
