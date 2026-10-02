import { Request, Response } from '@casepilot/cqrs';
import type { DocumentVersion } from '../../domain/entities/document-version.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateDocumentVersionData {
  readonly documentId: string;
  readonly versionNumber: number;
  readonly storageKey: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: string;
  readonly checksum?: string | null;
  readonly uploadedByMemberId: string;
}
export interface UpdateDocumentVersionData {
  readonly documentId?: string;
  readonly versionNumber?: number;
  readonly storageKey?: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly sizeBytes?: string;
  readonly checksum?: string | null;
  readonly uploadedByMemberId?: string;
}
export class DocumentVersionResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly documentId: string,
    public readonly versionNumber: number,
    public readonly storageKey: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly sizeBytes: string,
    public readonly checksum: string | null,
    public readonly uploadedByMemberId: string,
  ) { super(); }
}
export function toDocumentVersionResponse(entity: DocumentVersion): DocumentVersionResponse {
  return new DocumentVersionResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.documentId, entity.versionNumber, entity.storageKey, entity.fileName, entity.mimeType, entity.sizeBytes, entity.checksum, entity.uploadedByMemberId);
}
export class CreateDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDocumentVersionData) { super(); }
}
export class CreateDocumentVersionResponse extends Response {
  constructor(public readonly item: DocumentVersionResponse) { super(); }
}
export class GetDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetDocumentVersionResponse extends Response {
  constructor(public readonly item: DocumentVersionResponse) { super(); }
}
export class UpdateDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDocumentVersionData) { super(); }
}
export class UpdateDocumentVersionResponse extends Response {
  constructor(public readonly item: DocumentVersionResponse) { super(); }
}
export class DeleteDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteDocumentVersionResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListDocumentVersionsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListDocumentVersionsResponse extends Response {
  constructor(public readonly items: readonly DocumentVersionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
