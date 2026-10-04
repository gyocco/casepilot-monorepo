import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Folder } from '../../../domain/entities/folder.js';
import { UpdateFolderResponse } from './update-folder.response.js';
import { toFolderResponse } from '../shared/folder.response.js';
import { type UpdateFolderRequest } from './update-folder.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { folderFields, validateFolderRelations } from '../shared/folder.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateFolderHandler implements Handler<UpdateFolderRequest, UpdateFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateFolderRequest): Promise<UpdateFolderResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, folderFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Folder();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.parentFolderId = request.data.parentFolderId !== undefined ? request.data.parentFolderId : existing.parentFolderId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.createdByMemberId = request.data.createdByMemberId !== undefined ? request.data.createdByMemberId : existing.createdByMemberId;
      await validateFolderRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateFolderResponse(toFolderResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
