import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateCaseTypeData {
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly isActive: boolean;
  readonly defaultWorkflowId?: string | null;
}
export class CreateCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseTypeData, public readonly actor: VerifiedIdentity) { super(); }
}
