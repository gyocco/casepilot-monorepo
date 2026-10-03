import type { CaseTypeResponse } from '../../application/case-types/case-type.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class CaseTypeHttpResponse {
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
  ) {}
}
export function toCaseTypeHttpResponse(item: CaseTypeResponse): CaseTypeHttpResponse {
  return new CaseTypeHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.name, item.description, item.code, item.isActive, item.defaultWorkflowId);
}
export class CaseTypeItemHttpResponse {
  constructor(public readonly item: CaseTypeHttpResponse) {}
}
export class CaseTypesPageHttpResponse {
  constructor(public readonly items: readonly CaseTypeHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCaseTypeHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
