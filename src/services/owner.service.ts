import { inject, Injectable, signal } from '@angular/core';
import { OwnerProfile, OwnerProfileResponse } from '../models/owner.model';
import { HttpClient } from '@angular/common/http';
import { app_config } from '../app/core/config/app.config';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OwnerProfileService {
  _profile = signal<OwnerProfile>({
    shopName: '',
    address: '',
    pinCode: '',
    gstin: '',
    productCategories: [],
    stockManagement: false,
  });
  http = inject(HttpClient);

  readonly profile = this._profile.asReadonly();
  private _profileExists = signal(false);

  saveProfile(profile: OwnerProfile): void {
    if (this._profileExists()) {
      this.http
        .put<OwnerProfile>(`${app_config.API_BASE_URL}/api/owner`, profile)
        .pipe(
          tap((updatedProfile) => {
            this._profile.set(updatedProfile);
            this._profileExists.set(true);
          }),
        )
        .subscribe();
    } else {
      this.http
        .post<OwnerProfileResponse>(`${app_config.API_BASE_URL}/api/owner`, profile)
        .pipe(
          tap((createdProfile: OwnerProfileResponse) => {
            this._profile.set(createdProfile.data);
            this._profileExists.set(true);
          }),
        )
        .subscribe();
    }
  }

  loadProfile(): Observable<OwnerProfile> | void {
    return this.http.get<OwnerProfile>(`${app_config.API_BASE_URL}/api/owner`).pipe(
      tap((profile) => {
        this._profile.set(profile);
        this._profileExists.set(true);
      }),

      catchError((error) => {
        if (error.status === 404) {
          // Owner doesn't exist yet
          this._profileExists.set(false);

          return of(this._profile());
        }

        console.error('Failed to load owner profile:', error);

        this._profileExists.set(false);

        return of(this._profile());
      }),
    );
  }

  updateProductCategories(newCategory: string): void {
    const profile = this._profile();

    if (!profile) {
      return;
    }

    const productCategories = [...(profile.productCategories ?? []), newCategory.trim()];

    this.http
      .put<OwnerProfile>(`${app_config.API_BASE_URL}/api/owner`, {
        ...profile,
        productCategories,
      })
      .subscribe({
        next: () => {
          this._profile.set({
            ...profile,
            productCategories,
          });
        },
      });
  }
}
