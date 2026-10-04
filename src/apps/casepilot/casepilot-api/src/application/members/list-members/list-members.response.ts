import type { MemberResponse } from '../shared/member.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListMembersResponse extends Response {
  constructor(public readonly items: readonly MemberResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
