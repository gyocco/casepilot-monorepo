import type { CaseTypeResponse } from '../shared/case-type.response.js';
import { Response } from '@casepilot/cqrs';

export class GetCaseTypeResponse extends Response {
  constructor(public readonly item: CaseTypeResponse) { super(); }
}
