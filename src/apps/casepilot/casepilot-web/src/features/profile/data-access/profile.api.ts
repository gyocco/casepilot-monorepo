import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { AppConfigStore } from '../../../core/config/app-config';
import type {
  BootstrapProfileResponse,
  BusinessAccountEnvelopeResponse,
  ProfileEnvelopeResponse,
  UpdateProfilePayload,
} from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly configStore = inject(AppConfigStore);

  private baseUrl(): string {
    return this.configStore.config().apiBaseUrl;
  }

  bootstrapCurrentUser(): Observable<BootstrapProfileResponse> {
    return this.http.post<BootstrapProfileResponse>(`${this.baseUrl()}/auth/me/bootstrap`, {});
  }

  getCurrentUserProfile(): Observable<ProfileEnvelopeResponse> {
    return this.http.get<ProfileEnvelopeResponse>(`${this.baseUrl()}/auth/me`);
  }

  updateCurrentUserProfile(payload: UpdateProfilePayload): Observable<ProfileEnvelopeResponse> {
    return this.http.patch<ProfileEnvelopeResponse>(`${this.baseUrl()}/auth/me`, payload);
  }

  getBusinessAccount(businessAccountId: string): Observable<BusinessAccountEnvelopeResponse> {
    return this.http.get<BusinessAccountEnvelopeResponse>(`${this.baseUrl()}/business-accounts/${businessAccountId}`);
  }
}
