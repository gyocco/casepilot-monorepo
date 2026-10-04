import { Request } from '@casepilot/cqrs';

export interface CreateStatusDefinitionData {
  readonly entityType: string;
  readonly caseTypeId?: string | null;
  readonly name: string;
  readonly code: string;
  readonly category?: string | null;
  readonly sortOrder: number;
  readonly isInitial: boolean;
  readonly isTerminal: boolean;
  readonly isActive: boolean;
}
export class CreateStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateStatusDefinitionData) { super(); }
}
