export class HealthCheckObjectResponse {
  constructor(
    public readonly guid: string,
    public readonly value: string,
  ) {}
}

export class GetHealthCheckObjectsResponse {
  public readonly status = 'ok' as const;

  constructor(public readonly objects: readonly HealthCheckObjectResponse[]) {}
}
