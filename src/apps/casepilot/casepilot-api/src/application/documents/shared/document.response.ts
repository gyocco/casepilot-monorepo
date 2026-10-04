import { Response } from '@casepilot/cqrs';
import type { Document } from '../../../domain/entities/document.js';

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
