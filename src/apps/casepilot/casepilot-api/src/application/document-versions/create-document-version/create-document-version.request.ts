import { Request } from '@casepilot/cqrs';

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
export class CreateDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDocumentVersionData) { super(); }
}
