import type { Entity } from '@casepilot/abstractions';

export class HealthCheckObject implements Entity<string> {
  constructor(
    public readonly guid: string,
    public readonly value: string,
  ) {}

  get id(): string { return this.guid; }
}
