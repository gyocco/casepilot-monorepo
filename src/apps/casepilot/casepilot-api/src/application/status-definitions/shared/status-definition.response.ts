import { Response } from '@casepilot/cqrs';
import type { StatusDefinition } from '../../../domain/entities/status-definition.js';

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
