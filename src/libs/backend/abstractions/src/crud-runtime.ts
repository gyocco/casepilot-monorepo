/** Injectable identity/clock port, independent of Node and the database. */
export interface CrudRuntime {
  newId(): string;
  now(): string;
}
