import { Request } from '@casepilot/cqrs';

export interface UpdateStatusDefinitionData {
  readonly entityType?: string;
  readonly caseTypeId?: string | null;
  readonly name?: string;
  readonly code?: string;
  readonly category?: string | null;
  readonly sortOrder?: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
  readonly isActive?: boolean;
}
export class UpdateStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateStatusDefinitionData) { super(); }
}
