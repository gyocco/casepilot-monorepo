import { Request } from '@casepilot/cqrs';

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
export class UpdateDocumentVersionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDocumentVersionData) { super(); }
}
