import { Request, Response, type Handler } from '../src/index.js';

class Input extends Request { readonly id = 'example'; }
class Output extends Response { readonly found = true; }
type Assert<T extends true> = T;
type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends (<V>() => V extends U ? 1 : 2) ? true : false;

export type ContractChecks = [
  Assert<Equal<Parameters<Handler<Input, Output>['execute']>, [Input]>>,
  Assert<Equal<ReturnType<Handler<Input, Output>['execute']>, Promise<Output>>>,
  Assert<Equal<Input extends Request ? true : false, true>>,
  Assert<Equal<Output extends Response ? true : false, true>>,
  Assert<Equal<Output extends ReturnType<Handler<Input, Output>['execute']> ? true : false, false>>,
];

// @ts-expect-error Requests must be objects, including operations with a single primitive input.
export type PrimitiveRequest = Handler<string, Output>;
// @ts-expect-error Responses must be objects, including operations without a functional payload.
export type PrimitiveResponse = Handler<Input, string>;

// @ts-expect-error A structural request without the shared Request base is not a valid input.
export type UnbrandedRequest = Handler<{ readonly id: string }, Output>;
// @ts-expect-error A structural response without the shared Response base is not a valid output.
export type UnbrandedResponse = Handler<Input, { readonly found: boolean }>;
// @ts-expect-error Request and Response have distinct protected brands.
export type ReversedModels = Handler<Output, Input>;
