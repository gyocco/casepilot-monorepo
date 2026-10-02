import type { Entity } from '@casepilot/abstractions';
export class ReferenceRecord implements Entity<string> {
  constructor(
    public readonly id: string,
    public readonly businessAccountId: string | null,
    public readonly caseId: string | null,
    public readonly parentId: string | null,
  ) {}
}
