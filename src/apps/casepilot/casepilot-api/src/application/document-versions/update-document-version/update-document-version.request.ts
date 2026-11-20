import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

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
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDocumentVersionData, public readonly actor: VerifiedIdentity) { super(); }
}
