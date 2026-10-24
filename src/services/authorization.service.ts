import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { app_config } from '../app/core/config/app.config';

interface AuthorizationResponse {
  success: boolean;
  message: string;
  authorized: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private readonly http = inject(HttpClient);

  private readonly _authorized = signal(false);

  readonly authorized = this._authorized.asReadonly();

  authorize(password: string, confirmPassword?: string) {
    return this.http
      .post<AuthorizationResponse>(`${app_config.API_BASE_URL}/api/owner/authorize`, {
        password,
        ...(confirmPassword !== undefined ? { confirmPassword } : {}),
      })
      .pipe(
        tap((response) => {
          if (response.authorized) {
            this._authorized.set(true);
          }
        }),
      );
  }

  logout(): void {
    this._authorized.set(false);
  }
}
