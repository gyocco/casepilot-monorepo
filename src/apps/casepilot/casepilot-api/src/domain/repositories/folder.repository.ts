import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Folder } from '../entities/folder.js';
export interface FolderRepository extends DataRepository<Folder> {
  readonly entityType?: Folder;
}
