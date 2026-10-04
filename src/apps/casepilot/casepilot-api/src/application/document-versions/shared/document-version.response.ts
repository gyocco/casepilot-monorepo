import { Response } from '@casepilot/cqrs';
import type { DocumentVersion } from '../../../domain/entities/document-version.js';

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
