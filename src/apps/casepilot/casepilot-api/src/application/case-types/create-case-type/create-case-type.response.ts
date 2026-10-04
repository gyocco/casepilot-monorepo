import type { CaseTypeResponse } from '../shared/case-type.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateCaseTypeResponse extends Response {
  constructor(public readonly item: CaseTypeResponse) { super(); }
}
