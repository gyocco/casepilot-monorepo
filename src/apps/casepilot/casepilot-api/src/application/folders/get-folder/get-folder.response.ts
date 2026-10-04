import type { FolderResponse } from '../shared/folder.response.js';
import { Response } from '@casepilot/cqrs';

export class GetFolderResponse extends Response {
  constructor(public readonly item: FolderResponse) { super(); }
}
