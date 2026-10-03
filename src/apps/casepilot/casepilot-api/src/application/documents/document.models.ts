import { Request, Response } from '@casepilot/cqrs';
import type { Document } from '../../domain/entities/document.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateDocumentData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly folderId?: string | null;
  readonly name: string;
  readonly description?: string | null;
  readonly documentType?: string | null;
  readonly currentVersionId?: string | null;
  readonly createdByMemberId: string;
}
export interface UpdateDocumentData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly folderId?: string | null;
  readonly name?: string;
  readonly description?: string | null;
  readonly documentType?: string | null;
  readonly currentVersionId?: string | null;
  readonly createdByMemberId?: string;
}
export class DocumentResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly externalPartyId: string | null,
    public readonly folderId: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly documentType: string | null,
    public readonly currentVersionId: string | null,
    public readonly createdByMemberId: string,
  ) { super(); }
}
export function toDocumentResponse(entity: Document): DocumentResponse {
  return new DocumentResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.externalPartyId, entity.folderId, entity.name, entity.description, entity.documentType, entity.currentVersionId, entity.createdByMemberId);
}
export class CreateDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDocumentData) { super(); }
}
export class CreateDocumentResponse extends Response {
  constructor(public readonly item: DocumentResponse) { super(); }
}
export class GetDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetDocumentResponse extends Response {
  constructor(public readonly item: DocumentResponse) { super(); }
}
export class UpdateDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDocumentData) { super(); }
}
export class UpdateDocumentResponse extends Response {
  constructor(public readonly item: DocumentResponse) { super(); }
}
export class DeleteDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteDocumentResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListDocumentsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListDocumentsResponse extends Response {
  constructor(public readonly items: readonly DocumentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
