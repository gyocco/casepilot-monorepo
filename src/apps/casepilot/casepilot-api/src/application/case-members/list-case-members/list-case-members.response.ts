import type { CaseMemberResponse } from '../shared/case-member.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCaseMembersResponse extends Response {
  constructor(public readonly items: readonly CaseMemberResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
