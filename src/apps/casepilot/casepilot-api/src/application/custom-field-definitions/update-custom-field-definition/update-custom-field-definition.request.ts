import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';
import type { JsonValue } from '@casepilot/abstractions';

export interface UpdateCustomFieldDefinitionData {
  readonly entityType?: string;
  readonly caseTypeId?: string | null;
  readonly name?: string;
  readonly key?: string;
  readonly dataType?: string;
  readonly required?: boolean;
  readonly configuration?: JsonValue | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}
export class UpdateCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCustomFieldDefinitionData, public readonly actor: VerifiedIdentity) { super(); }
}
