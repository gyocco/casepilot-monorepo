/** Technical transaction failure; no SQL, credentials or driver objects cross the port. */
export class UnitOfWorkError extends Error {
  constructor() {
    super('The transaction could not complete.');
    this.name = 'UnitOfWorkError';
  }
}
