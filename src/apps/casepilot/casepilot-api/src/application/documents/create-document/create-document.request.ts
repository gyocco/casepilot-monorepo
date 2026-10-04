import { Request } from '@casepilot/cqrs';

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
export class CreateDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDocumentData) { super(); }
}
