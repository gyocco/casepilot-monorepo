import type { FolderResponse } from '../../application/folders/folder.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class FolderHttpResponse {
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
  ) {}
}
export function toFolderHttpResponse(item: FolderResponse): FolderHttpResponse {
  return new FolderHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.parentFolderId, item.name, item.createdByMemberId);
}
export class FolderItemHttpResponse {
  constructor(public readonly item: FolderHttpResponse) {}
}
export class FoldersPageHttpResponse {
  constructor(public readonly items: readonly FolderHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteFolderHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
