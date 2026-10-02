import type { DataRepository } from './data.repository.js';
import type { Folder } from '../entities/folder.js';
export interface FolderRepository extends DataRepository<Folder> {
  readonly entityType?: Folder;
}
