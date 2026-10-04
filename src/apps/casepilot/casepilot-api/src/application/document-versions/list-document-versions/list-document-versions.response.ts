import type { DocumentVersionResponse } from '../shared/document-version.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListDocumentVersionsResponse extends Response {
  constructor(public readonly items: readonly DocumentVersionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
