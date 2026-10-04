import { Request } from '@casepilot/cqrs';

export interface CreateFolderData {
  readonly caseId?: string | null;
  readonly parentFolderId?: string | null;
  readonly name: string;
  readonly createdByMemberId: string;
}
export class CreateFolderRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateFolderData) { super(); }
}
