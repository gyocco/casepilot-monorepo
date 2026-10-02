import type { CrudRepository, Entity, Repository, UnitOfWork } from '../src/index.js';

class Row implements Entity<string> { readonly id: string = 'row'; }
interface Scope { readonly rows: CrudRepository<Row, string> }
type Assert<T extends true> = T;
type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends (<V>() => V extends U ? 1 : 2) ? true : false;

export type ContractChecks = [
  Assert<Equal<Parameters<CrudRepository<Row>['getById']>, [string]>>,
  Assert<Equal<ReturnType<CrudRepository<Row>['getById']>, Promise<Row | null>>>,
  Assert<Equal<ReturnType<CrudRepository<Row>['getAll']>, Promise<readonly Row[]>>>,
  Assert<Equal<'getAll' extends keyof Repository<Row> ? true : false, false>>,
  Assert<Equal<Repository<Row>['entityType'], Row | undefined>>,
  Assert<Equal<ReturnType<UnitOfWork<Scope>['execute']>, Promise<unknown>>>,
];
// @ts-expect-error CRUD data must have an entity identifier.
export type InvalidEntity = CrudRepository<{ readonly value: string }>;
// @ts-expect-error The entity's ID must match the declared repository ID.
export type InvalidIdentifier = CrudRepository<Row, number>;
// @ts-expect-error IDs are limited to string, number or bigint.
export type InvalidEntityId = Entity<object>;
// @ts-expect-error A UnitOfWork scope can contain only repositories.
export type InvalidScope = UnitOfWork<{ readonly manager: { transaction(): Promise<void> } }>;
