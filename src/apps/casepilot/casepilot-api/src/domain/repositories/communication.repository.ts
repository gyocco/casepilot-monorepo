import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Communication } from '../entities/communication.js';
export interface CommunicationRepository extends DataRepository<Communication> {
  readonly entityType?: Communication;
}
