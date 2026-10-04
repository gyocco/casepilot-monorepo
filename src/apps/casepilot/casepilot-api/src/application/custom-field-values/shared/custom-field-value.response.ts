import { Response } from '@casepilot/cqrs';
import type { CustomFieldValue } from '../../../domain/entities/custom-field-value.js';
import type { JsonValue } from '@casepilot/abstractions';

export class CustomFieldValueResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly customFieldDefinitionId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly valueText: string | null,
    public readonly valueNumber: string | null,
    public readonly valueDate: string | null,
    public readonly valueBoolean: boolean | null,
    public readonly valueJson: JsonValue | null,
  ) { super(); }
}
export function toCustomFieldValueResponse(entity: CustomFieldValue): CustomFieldValueResponse {
  return new CustomFieldValueResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.customFieldDefinitionId, entity.entityType, entity.entityId, entity.valueText, entity.valueNumber, entity.valueDate, entity.valueBoolean, entity.valueJson);
}
