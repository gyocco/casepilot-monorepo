import type { DocumentResponse } from '../shared/document.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListDocumentsResponse extends Response {
  constructor(public readonly items: readonly DocumentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
