import type { StatusDefinitionResponse } from '../../application/status-definitions/status-definition.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class StatusDefinitionHttpResponse {
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
  ) {}
}
export function toStatusDefinitionHttpResponse(item: StatusDefinitionResponse): StatusDefinitionHttpResponse {
  return new StatusDefinitionHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.entityType, item.caseTypeId, item.name, item.code, item.category, item.sortOrder, item.isInitial, item.isTerminal, item.isActive);
}
export class StatusDefinitionItemHttpResponse {
  constructor(public readonly item: StatusDefinitionHttpResponse) {}
}
export class StatusDefinitionsPageHttpResponse {
  constructor(public readonly items: readonly StatusDefinitionHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteStatusDefinitionHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
