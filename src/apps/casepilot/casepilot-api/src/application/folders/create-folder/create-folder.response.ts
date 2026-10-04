import type { FolderResponse } from '../shared/folder.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateFolderResponse extends Response {
  constructor(public readonly item: FolderResponse) { super(); }
}
