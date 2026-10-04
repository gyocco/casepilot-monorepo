import type { DocumentVersionResponse } from '../shared/document-version.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateDocumentVersionResponse extends Response {
  constructor(public readonly item: DocumentVersionResponse) { super(); }
}
