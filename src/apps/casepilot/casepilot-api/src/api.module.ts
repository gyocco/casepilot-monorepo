import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/health/health.module.js';

// Register each resource module once; its endpoints and bindings stay in that module.
@Module({
  imports: [HealthModule],
})
export class ApiModule {}
