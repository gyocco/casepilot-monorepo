import type { EntityManager } from 'typeorm';
import type { Communication } from '../../../domain/entities/communication.js';
import type { CommunicationRepository } from '../../../domain/repositories/communication.repository.js';
import { communicationTable } from '../schemas/communication.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmCommunicationRepository extends TypeOrmDataRepository<Communication> implements CommunicationRepository {
  constructor(manager: EntityManager) { super(manager, communicationTable); }
}
