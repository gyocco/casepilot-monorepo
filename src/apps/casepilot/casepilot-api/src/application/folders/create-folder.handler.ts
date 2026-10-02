import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Folder } from '../../domain/entities/folder.js';
import { CreateFolderResponse, toFolderResponse, type CreateFolderRequest } from './folder.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { folderFields, validateFolderRelations } from './folder.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateFolderHandler implements Handler<CreateFolderRequest, CreateFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateFolderRequest): Promise<CreateFolderResponse> {
    return runPersistence(() => this.work.execute(async scope => {
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
