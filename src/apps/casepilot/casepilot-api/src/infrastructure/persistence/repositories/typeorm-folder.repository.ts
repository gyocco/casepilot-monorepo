import type { EntityManager } from 'typeorm';
import type { Folder } from '../../../domain/entities/folder.js';
import type { FolderRepository } from '../../../domain/repositories/folder.repository.js';
import { folderTable } from '../schemas/folder.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmFolderRepository extends TypeOrmDataRepository<Folder> implements FolderRepository {
  constructor(manager: EntityManager) { super(manager, folderTable); }
}
