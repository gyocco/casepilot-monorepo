import { Request } from '@casepilot/cqrs';
import type { JsonValue } from '@casepilot/abstractions';

export interface CreateCustomFieldDefinitionData {
  readonly entityType: string;
  readonly caseTypeId?: string | null;
  readonly name: string;
  readonly key: string;
  readonly dataType: string;
  readonly required: boolean;
  readonly configuration?: JsonValue | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}
export class CreateCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCustomFieldDefinitionData) { super(); }
}
