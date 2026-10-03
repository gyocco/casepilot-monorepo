import { Request, Response } from '@casepilot/cqrs';
import type { CaseType } from '../../domain/entities/case-type.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateCaseTypeData {
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly isActive: boolean;
  readonly defaultWorkflowId?: string | null;
}
export interface UpdateCaseTypeData {
  readonly name?: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly isActive?: boolean;
  readonly defaultWorkflowId?: string | null;
}
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
export class CreateCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseTypeData) { super(); }
}
export class CreateCaseTypeResponse extends Response {
  constructor(public readonly item: CaseTypeResponse) { super(); }
}
export class GetCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCaseTypeResponse extends Response {
  constructor(public readonly item: CaseTypeResponse) { super(); }
}
export class UpdateCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseTypeData) { super(); }
}
export class UpdateCaseTypeResponse extends Response {
  constructor(public readonly item: CaseTypeResponse) { super(); }
}
export class DeleteCaseTypeRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCaseTypeResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCaseTypesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCaseTypesResponse extends Response {
  constructor(public readonly items: readonly CaseTypeResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
