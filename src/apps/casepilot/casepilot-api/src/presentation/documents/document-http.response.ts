import type { DocumentResponse } from '../../application/documents/document.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class DocumentHttpResponse {
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
  ) {}
}
export function toDocumentHttpResponse(item: DocumentResponse): DocumentHttpResponse {
  return new DocumentHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.externalPartyId, item.folderId, item.name, item.description, item.documentType, item.currentVersionId, item.createdByMemberId);
}
export class DocumentItemHttpResponse {
  constructor(public readonly item: DocumentHttpResponse) {}
}
export class DocumentsPageHttpResponse {
  constructor(public readonly items: readonly DocumentHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteDocumentHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
