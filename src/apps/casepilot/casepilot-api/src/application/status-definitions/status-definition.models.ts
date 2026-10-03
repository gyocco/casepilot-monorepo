import { Request, Response } from '@casepilot/cqrs';
import type { StatusDefinition } from '../../domain/entities/status-definition.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateStatusDefinitionData {
  readonly entityType: string;
  readonly caseTypeId?: string | null;
  readonly name: string;
  readonly code: string;
  readonly category?: string | null;
  readonly sortOrder: number;
  readonly isInitial: boolean;
  readonly isTerminal: boolean;
  readonly isActive: boolean;
}
export interface UpdateStatusDefinitionData {
  readonly entityType?: string;
  readonly caseTypeId?: string | null;
  readonly name?: string;
  readonly code?: string;
  readonly category?: string | null;
  readonly sortOrder?: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
  readonly isActive?: boolean;
}
export class StatusDefinitionResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly entityType: string,
    public readonly caseTypeId: string | null,
    public readonly name: string,
    public readonly code: string,
    public readonly category: string | null,
    public readonly sortOrder: number,
    public readonly isInitial: boolean,
    public readonly isTerminal: boolean,
    public readonly isActive: boolean,
  ) { super(); }
}
export function toStatusDefinitionResponse(entity: StatusDefinition): StatusDefinitionResponse {
  return new StatusDefinitionResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.entityType, entity.caseTypeId, entity.name, entity.code, entity.category, entity.sortOrder, entity.isInitial, entity.isTerminal, entity.isActive);
}
export class CreateStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateStatusDefinitionData) { super(); }
}
export class CreateStatusDefinitionResponse extends Response {
  constructor(public readonly item: StatusDefinitionResponse) { super(); }
}
export class GetStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetStatusDefinitionResponse extends Response {
  constructor(public readonly item: StatusDefinitionResponse) { super(); }
}
export class UpdateStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateStatusDefinitionData) { super(); }
}
export class UpdateStatusDefinitionResponse extends Response {
  constructor(public readonly item: StatusDefinitionResponse) { super(); }
}
export class DeleteStatusDefinitionRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteStatusDefinitionResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListStatusDefinitionsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListStatusDefinitionsResponse extends Response {
  constructor(public readonly items: readonly StatusDefinitionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
