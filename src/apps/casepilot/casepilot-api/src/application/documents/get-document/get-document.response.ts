import type { DocumentResponse } from '../shared/document.response.js';
import { Response } from '@casepilot/cqrs';

export class GetDocumentResponse extends Response {
  constructor(public readonly item: DocumentResponse) { super(); }
}
