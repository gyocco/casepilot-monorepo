import { Response } from '@casepilot/cqrs';

export class HealthCheckObjectResponse extends Response {
  constructor(
    public readonly guid: string,
    public readonly value: string,
  ) { super(); }
}

export class GetHealthCheckObjectsResponse extends Response {
  constructor(public readonly objects: readonly HealthCheckObjectResponse[]) { super(); }
}
