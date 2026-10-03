import type { DocumentVersionResponse } from '../../application/document-versions/document-version.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class DocumentVersionHttpResponse {
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
  ) {}
}
export function toDocumentVersionHttpResponse(item: DocumentVersionResponse): DocumentVersionHttpResponse {
  return new DocumentVersionHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.documentId, item.versionNumber, item.storageKey, item.fileName, item.mimeType, item.sizeBytes, item.checksum, item.uploadedByMemberId);
}
export class DocumentVersionItemHttpResponse {
  constructor(public readonly item: DocumentVersionHttpResponse) {}
}
export class DocumentVersionsPageHttpResponse {
  constructor(public readonly items: readonly DocumentVersionHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteDocumentVersionHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
