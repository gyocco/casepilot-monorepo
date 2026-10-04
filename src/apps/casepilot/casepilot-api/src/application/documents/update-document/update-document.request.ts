import { Request } from '@casepilot/cqrs';

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
export class UpdateDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDocumentData) { super(); }
}
