import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core';
import { ProblemDetailsFilter } from './problem-details.filter.js';
import type { ExceptionHandlerOptions } from './problem-details.js';

@Module({})
export class ExceptionHandlerModule {
  static register(options: ExceptionHandlerOptions = {}): DynamicModule {
    return {
      module: ExceptionHandlerModule,
      providers: [{
        provide: APP_FILTER,
        inject: [HttpAdapterHost],
        useFactory: (adapterHost: HttpAdapterHost): ProblemDetailsFilter => new ProblemDetailsFilter(adapterHost, options),
      }],
    };
  }
}
