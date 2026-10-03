export type PersistenceErrorReason = 'unique' | 'reference' | 'required' | 'concurrent' | 'unavailable' | 'invalid-data';

/** Normalized technical failure; consumers decide its functional meaning. */
export class PersistenceError extends Error {
  constructor(public readonly reason: PersistenceErrorReason, options: ErrorOptions = {}) {
    super('Persistence operation failed.', options);
    this.name = 'PersistenceError';
  }
}
