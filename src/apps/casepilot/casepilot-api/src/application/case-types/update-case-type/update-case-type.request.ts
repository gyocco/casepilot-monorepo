import { Request } from '@casepilot/cqrs';

export interface UpdateCaseTypeData {
  readonly name?: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly isActive?: boolean;
  readonly defaultWorkflowId?: string | null;
}
export class UpdateCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseTypeData) { super(); }
}
