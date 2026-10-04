import { Request } from '@casepilot/cqrs';
import type { JsonValue } from '@casepilot/abstractions';

export interface CreateCustomFieldValueData {
  readonly customFieldDefinitionId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly valueText?: string | null;
  readonly valueNumber?: string | null;
  readonly valueDate?: string | null;
  readonly valueBoolean?: boolean | null;
  readonly valueJson?: JsonValue | null;
}
export class CreateCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCustomFieldValueData) { super(); }
}
