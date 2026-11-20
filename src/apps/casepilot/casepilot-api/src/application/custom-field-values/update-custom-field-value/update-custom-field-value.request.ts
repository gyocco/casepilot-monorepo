import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';
import type { JsonValue } from '@casepilot/abstractions';

export interface UpdateCustomFieldValueData {
  readonly customFieldDefinitionId?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly valueText?: string | null;
  readonly valueNumber?: string | null;
  readonly valueDate?: string | null;
  readonly valueBoolean?: boolean | null;
  readonly valueJson?: JsonValue | null;
}
export class UpdateCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCustomFieldValueData, public readonly actor: VerifiedIdentity) { super(); }
}
