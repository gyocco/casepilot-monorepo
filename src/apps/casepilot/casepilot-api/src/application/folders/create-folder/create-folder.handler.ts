import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Folder } from '../../../domain/entities/folder.js';
import { CreateFolderResponse } from './create-folder.response.js';
import { toFolderResponse } from '../shared/folder.response.js';
import { type CreateFolderRequest } from './create-folder.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { folderFields, validateFolderRelations } from '../shared/folder.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateFolderHandler implements Handler<CreateFolderRequest, CreateFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateFolderRequest): Promise<CreateFolderResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, folderFields, false);
      const entity = new Folder();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.parentFolderId = request.data.parentFolderId ?? null;
      entity.name = request.data.name;
      entity.createdByMemberId = request.data.createdByMemberId;
      await validateFolderRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateFolderResponse(toFolderResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
