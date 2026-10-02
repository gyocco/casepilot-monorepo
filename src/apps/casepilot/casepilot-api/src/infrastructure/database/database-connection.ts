import type { OnModuleDestroy } from '@nestjs/common';
import type { DataSource } from 'typeorm';

// The HTTP listener can start without PostgreSQL; only data access initializes it.
export class DatabaseConnection implements OnModuleDestroy {
  private initialization: Promise<DataSource> | undefined;
  private closing = false;

  constructor(private readonly source: DataSource) {}

  async getDataSource(): Promise<DataSource> {
    if (this.closing) throw new Error('Database connection is closing.');
    if (this.source.isInitialized) return this.source;
    if (this.initialization) return this.initialization;
    const attempt = this.source.initialize();
    this.initialization = attempt;
    try {
      return await attempt;
    } finally {
      this.initialization = undefined;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.closing = true;
    try { await this.initialization; } catch { /* A failed connection has no pool to close. */ }
    if (this.source.isInitialized) await this.source.destroy();
  }
}
