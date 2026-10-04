import type { MemberResponse } from '../shared/member.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateMemberResponse extends Response {
  constructor(public readonly item: MemberResponse) { super(); }
}
