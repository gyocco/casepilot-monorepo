import { Response } from '@casepilot/cqrs';
import type { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import type { JsonValue } from '@casepilot/abstractions';

export class CustomFieldDefinitionResponse extends Response {
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
  ) { super(); }
}
export function toCustomFieldDefinitionResponse(entity: CustomFieldDefinition): CustomFieldDefinitionResponse {
  return new CustomFieldDefinitionResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.entityType, entity.caseTypeId, entity.name, entity.key, entity.dataType, entity.required, entity.configuration, entity.sortOrder, entity.isActive);
}
