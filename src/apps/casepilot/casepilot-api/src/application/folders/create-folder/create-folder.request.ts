import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateFolderData {
  readonly caseId?: string | null;
  readonly parentFolderId?: string | null;
  readonly name: string;
  readonly createdByMemberId: string;
}
export class CreateFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateFolderData, public readonly actor: VerifiedIdentity) { super(); }
}
