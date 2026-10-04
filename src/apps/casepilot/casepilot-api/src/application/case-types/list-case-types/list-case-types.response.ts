import type { CaseTypeResponse } from '../shared/case-type.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCaseTypesResponse extends Response {
  constructor(public readonly items: readonly CaseTypeResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
