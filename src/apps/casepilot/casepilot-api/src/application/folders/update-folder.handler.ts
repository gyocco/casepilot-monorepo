import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Folder } from '../../domain/entities/folder.js';
import { UpdateFolderResponse, toFolderResponse, type UpdateFolderRequest } from './folder.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { folderFields, validateFolderRelations } from './folder.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateFolderHandler implements Handler<UpdateFolderRequest, UpdateFolderResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateFolderRequest): Promise<UpdateFolderResponse> {
    return runPersistence(() => this.work.execute(async scope => {
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
