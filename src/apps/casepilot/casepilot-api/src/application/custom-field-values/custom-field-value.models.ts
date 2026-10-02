import { Request, Response } from '@casepilot/cqrs';
import type { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import type { JsonValue } from '../../domain/entities/stored-entity.js';
import type { PageMetadataResponse } from '../shared/crud-models.js';

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
export class CreateCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCustomFieldValueData) { super(); }
}
export class CreateCustomFieldValueResponse extends Response {
  constructor(public readonly item: CustomFieldValueResponse) { super(); }
}
export class GetCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCustomFieldValueResponse extends Response {
  constructor(public readonly item: CustomFieldValueResponse) { super(); }
}
export class UpdateCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCustomFieldValueData) { super(); }
}
export class UpdateCustomFieldValueResponse extends Response {
  constructor(public readonly item: CustomFieldValueResponse) { super(); }
}
export class DeleteCustomFieldValueRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCustomFieldValueResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCustomFieldValuesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCustomFieldValuesResponse extends Response {
  constructor(public readonly items: readonly CustomFieldValueResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
