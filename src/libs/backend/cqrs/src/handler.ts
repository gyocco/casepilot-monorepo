import type { Request } from './request.js';
import type { Response } from './response.js';

/** A directly invoked use case with one request and one asynchronous response. */
export interface Handler<TRequest extends Request, TResponse extends Response> {
  execute(request: TRequest): Promise<TResponse>;
}
