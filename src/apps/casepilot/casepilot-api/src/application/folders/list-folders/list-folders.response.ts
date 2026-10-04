import type { FolderResponse } from '../shared/folder.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListFoldersResponse extends Response {
  constructor(public readonly items: readonly FolderResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
