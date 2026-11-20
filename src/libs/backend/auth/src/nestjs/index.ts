import {
  createParamDecorator,
  Global,
  Inject,
  Injectable,
  Module,
  SetMetadata,
  type CanActivate,
  type DynamicModule,
  type ExecutionContext,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { UnauthorizedError } from '@casepilot/abstractions';
import { parseBearerToken, type TokenVerifier, type VerifiedIdentity } from '../index.js';

export const PUBLIC_ENDPOINT_METADATA = 'casepilot:auth:public';
export const TOKEN_VERIFIER = Symbol('casepilot:auth:token-verifier');
export const VERIFIED_IDENTITY_KEY = Symbol('casepilot:auth:verified-identity');

interface AuthenticatedHttpRequest {
  readonly headers?: Readonly<Record<string, string | readonly string[] | undefined>>;
  [VERIFIED_IDENTITY_KEY]?: VerifiedIdentity;
}

export function PublicEndpoint(): MethodDecorator & ClassDecorator {
  return SetMetadata(PUBLIC_ENDPOINT_METADATA, true);
}

export const CurrentIdentity = createParamDecorator((_data: unknown, context: ExecutionContext): VerifiedIdentity => {
  const request = context.switchToHttp().getRequest<AuthenticatedHttpRequest>();
  const identity = request[VERIFIED_IDENTITY_KEY];
  if (!identity) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return identity;
});

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ENDPOINT_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedHttpRequest>();
    const token = parseBearerToken(request.headers?.authorization);
    try {
      request[VERIFIED_IDENTITY_KEY] = await this.verifier.verify(token);
      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Authentication token is invalid or expired.');
    }
  }
}

@Injectable()
class TokenVerifierLifecycle implements OnApplicationShutdown {
  constructor(@Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.verifier.close) await this.verifier.close();
  }
}

export interface NestAuthModuleOptions {
  readonly verifier: TokenVerifier;
}

@Global()
@Module({})
export class NestAuthModule {
  static register(options: NestAuthModuleOptions): DynamicModule {
    return {
      module: NestAuthModule,
      providers: [
        { provide: TOKEN_VERIFIER, useValue: options.verifier },
        { provide: APP_GUARD, useClass: BearerAuthGuard },
        TokenVerifierLifecycle,
      ],
      exports: [TOKEN_VERIFIER],
    };
  }
}
