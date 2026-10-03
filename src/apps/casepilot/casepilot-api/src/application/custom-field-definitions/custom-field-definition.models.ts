import { Request, Response } from '@casepilot/cqrs';
import type { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.js';
import type { JsonValue } from '@casepilot/abstractions';
import type { PageMetadataResponse } from '@casepilot/cqrs';

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
export class CreateCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCustomFieldDefinitionData) { super(); }
}
export class CreateCustomFieldDefinitionResponse extends Response {
  constructor(public readonly item: CustomFieldDefinitionResponse) { super(); }
}
export class GetCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCustomFieldDefinitionResponse extends Response {
  constructor(public readonly item: CustomFieldDefinitionResponse) { super(); }
}
export class UpdateCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCustomFieldDefinitionData) { super(); }
}
export class UpdateCustomFieldDefinitionResponse extends Response {
  constructor(public readonly item: CustomFieldDefinitionResponse) { super(); }
}
export class DeleteCustomFieldDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCustomFieldDefinitionResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCustomFieldDefinitionsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCustomFieldDefinitionsResponse extends Response {
  constructor(public readonly items: readonly CustomFieldDefinitionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
