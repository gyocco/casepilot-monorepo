import { Response } from '@casepilot/cqrs';
import type { CaseType } from '../../../domain/entities/case-type.js';

export class CaseTypeResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly code: string | null,
    public readonly isActive: boolean,
    public readonly defaultWorkflowId: string | null,
  ) { super(); }
}
export function toCaseTypeResponse(entity: CaseType): CaseTypeResponse {
  return new CaseTypeResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.name, entity.description, entity.code, entity.isActive, entity.defaultWorkflowId);
}
