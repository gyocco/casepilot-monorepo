import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Folder } from '../../domain/entities/folder.js';
import { GetFolderResponse, toFolderResponse, type GetFolderRequest } from './folder.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetFolderHandler implements Handler<GetFolderRequest, GetFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>) {}

  async execute(request: GetFolderRequest): Promise<GetFolderResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetFolderResponse(toFolderResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
