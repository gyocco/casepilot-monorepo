import type { CaseMemberResponse } from '../shared/case-member.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateCaseMemberResponse extends Response {
  constructor(public readonly item: CaseMemberResponse) { super(); }
}
