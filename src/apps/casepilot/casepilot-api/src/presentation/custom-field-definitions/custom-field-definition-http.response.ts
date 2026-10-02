import type { CustomFieldDefinitionResponse } from '../../application/custom-field-definitions/custom-field-definition.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';
import type { JsonValue } from '../../application/shared/crud-models.js';
export class CustomFieldDefinitionHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly entityType: string,
    public readonly caseTypeId: string | null,
    public readonly name: string,
    public readonly key: string,
    public readonly dataType: string,
    public readonly required: boolean,
    public readonly configuration: JsonValue | null,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
  ) {}
}
export function toCustomFieldDefinitionHttpResponse(item: CustomFieldDefinitionResponse): CustomFieldDefinitionHttpResponse {
  return new CustomFieldDefinitionHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.entityType, item.caseTypeId, item.name, item.key, item.dataType, item.required, item.configuration, item.sortOrder, item.isActive);
}
export class CustomFieldDefinitionItemHttpResponse {
  constructor(public readonly item: CustomFieldDefinitionHttpResponse) {}
}
export class CustomFieldDefinitionsPageHttpResponse {
  constructor(public readonly items: readonly CustomFieldDefinitionHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCustomFieldDefinitionHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
