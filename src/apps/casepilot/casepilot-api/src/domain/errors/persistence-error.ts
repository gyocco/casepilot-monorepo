export class PersistenceError extends Error {
  constructor(public readonly reason: 'unique' | 'reference' | 'required' | 'concurrent' | 'unavailable') {
    super('Persistence operation failed.');
  }
}
