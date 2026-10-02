import type { DataRepository } from './data.repository.js';
import type { Communication } from '../entities/communication.js';
export interface CommunicationRepository extends DataRepository<Communication> {
  readonly entityType?: Communication;
}
