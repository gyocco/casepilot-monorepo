import { Request, Response } from '@casepilot/cqrs';
import type { Folder } from '../../domain/entities/folder.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateFolderData {
  readonly caseId?: string | null;
  readonly parentFolderId?: string | null;
  readonly name: string;
  readonly createdByMemberId: string;
}
export interface UpdateFolderData {
  readonly caseId?: string | null;
  readonly parentFolderId?: string | null;
  readonly name?: string;
  readonly createdByMemberId?: string;
}
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
export class CreateFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateFolderData) { super(); }
}
export class CreateFolderResponse extends Response {
  constructor(public readonly item: FolderResponse) { super(); }
}
export class GetFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetFolderResponse extends Response {
  constructor(public readonly item: FolderResponse) { super(); }
}
export class UpdateFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateFolderData) { super(); }
}
export class UpdateFolderResponse extends Response {
  constructor(public readonly item: FolderResponse) { super(); }
}
export class DeleteFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteFolderResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListFoldersRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListFoldersResponse extends Response {
  constructor(public readonly items: readonly FolderResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
