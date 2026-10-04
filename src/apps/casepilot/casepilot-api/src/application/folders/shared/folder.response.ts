import { Response } from '@casepilot/cqrs';
import type { Folder } from '../../../domain/entities/folder.js';

export class FolderResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly parentFolderId: string | null,
    public readonly name: string,
    public readonly createdByMemberId: string,
  ) { super(); }
}
export function toFolderResponse(entity: Folder): FolderResponse {
  return new FolderResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.parentFolderId, entity.name, entity.createdByMemberId);
}
