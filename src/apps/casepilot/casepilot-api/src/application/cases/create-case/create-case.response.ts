import type { CaseResponse } from '../shared/case.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateCaseResponse extends Response {
  constructor(public readonly item: CaseResponse) { super(); }
}
