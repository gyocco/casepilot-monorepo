import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateFolderData {
  readonly caseId?: string | null;
  readonly parentFolderId?: string | null;
  readonly name?: string;
  readonly createdByMemberId?: string;
}
export class UpdateFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateFolderData, public readonly actor: VerifiedIdentity) { super(); }
}
