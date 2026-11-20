import { Body, Controller, Get, Header, Inject, Patch, Post } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { nullableString, numberValue, optionalString, readBody } from '@casepilot/validation/nestjs';
import { BootstrapCurrentUserHandler } from '../../application/auth/bootstrap-current-user/bootstrap-current-user.handler.js';
import { BootstrapCurrentUserRequest } from '../../application/auth/bootstrap-current-user/bootstrap-current-user.request.js';
import { GetCurrentUserProfileHandler } from '../../application/auth/get-current-user-profile/get-current-user-profile.handler.js';
import { GetCurrentUserProfileRequest } from '../../application/auth/get-current-user-profile/get-current-user-profile.request.js';
import { UpdateCurrentUserProfileHandler } from '../../application/auth/update-current-user-profile/update-current-user-profile.handler.js';
import { UpdateCurrentUserProfileRequest } from '../../application/auth/update-current-user-profile/update-current-user-profile.request.js';
import {
  BootstrapProfileHttpResponse,
  ProfileEnvelopeHttpResponse,
  toCurrentUserProfileHttpResponse,
} from './auth-http.response.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(BootstrapCurrentUserHandler) private readonly bootstrapHandler: BootstrapCurrentUserHandler,
    @Inject(GetCurrentUserProfileHandler) private readonly getProfileHandler: GetCurrentUserProfileHandler,
    @Inject(UpdateCurrentUserProfileHandler) private readonly updateProfileHandler: UpdateCurrentUserProfileHandler,
  ) {}

  @Post('me/bootstrap')
  @Header('Cache-Control', 'no-store')
  async bootstrap(@CurrentIdentity() actor: VerifiedIdentity): Promise<BootstrapProfileHttpResponse> {
    const response = await this.bootstrapHandler.execute(new BootstrapCurrentUserRequest(actor));
    return new BootstrapProfileHttpResponse(toCurrentUserProfileHttpResponse(response.profile), response.provisioned);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async getMe(@CurrentIdentity() actor: VerifiedIdentity): Promise<ProfileEnvelopeHttpResponse> {
    const response = await this.getProfileHandler.execute(new GetCurrentUserProfileRequest(actor));
    return new ProfileEnvelopeHttpResponse(toCurrentUserProfileHttpResponse(response.profile));
  }

  @Patch('me')
  @Header('Cache-Control', 'no-store')
  async updateMe(
    @CurrentIdentity() actor: VerifiedIdentity,
    @Body() input: unknown,
  ): Promise<ProfileEnvelopeHttpResponse> {
    const body = readBody(input, ['version', 'firstName', 'lastName', 'displayName', 'locale', 'timezone']);
    const response = await this.updateProfileHandler.execute(new UpdateCurrentUserProfileRequest(
      actor,
      numberValue(body, 'version'),
      {
        firstName: optionalString(body, 'firstName'),
        lastName: optionalString(body, 'lastName'),
        displayName: nullableString(body, 'displayName'),
        locale: nullableString(body, 'locale'),
        timezone: nullableString(body, 'timezone'),
      },
    ));
    return new ProfileEnvelopeHttpResponse(toCurrentUserProfileHttpResponse(response.profile));
  }
}
