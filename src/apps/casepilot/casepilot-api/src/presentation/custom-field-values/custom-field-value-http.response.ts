import type { CustomFieldValueResponse } from '../../application/custom-field-values/shared/custom-field-value.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import type { JsonValue } from '@casepilot/abstractions';
export class CustomFieldValueHttpResponse {
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
  ) {}
}
export function toCustomFieldValueHttpResponse(item: CustomFieldValueResponse): CustomFieldValueHttpResponse {
  return new CustomFieldValueHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.customFieldDefinitionId, item.entityType, item.entityId, item.valueText, item.valueNumber, item.valueDate, item.valueBoolean, item.valueJson);
}
export class CustomFieldValueItemHttpResponse {
  constructor(public readonly item: CustomFieldValueHttpResponse) {}
}
export class CustomFieldValuesPageHttpResponse {
  constructor(public readonly items: readonly CustomFieldValueHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCustomFieldValueHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
