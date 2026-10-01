export class ApiHealthHttpResponse {
  public readonly status = 'ok' as const;
}

export class HealthCheckObjectHttpResponse {
  constructor(
    public readonly guid: string,
    public readonly value: string,
  ) {}
}

export class DatabaseHealthHttpResponse {
  public readonly status = 'ok' as const;

  constructor(public readonly objects: readonly HealthCheckObjectHttpResponse[]) {}
}

export class DatabaseUnavailableHttpResponse {
  public readonly status = 'unavailable' as const;
}
