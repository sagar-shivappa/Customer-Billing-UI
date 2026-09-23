import { inject, Injectable, signal } from '@angular/core';
import { OwnerProfile } from '../models/owner.model';
import { HttpClient } from '@angular/common/http';
import { app_config } from '../app/core/config/app.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OwnerProfileService {
  _profile = signal<OwnerProfile>({
    shopName: '',
    address: '',
    pinCode: '',
    gstin: '',
  });
  http = inject(HttpClient);

  readonly profile = this._profile.asReadonly();

  saveProfile(profile: OwnerProfile): void {
    this.http.post<OwnerProfile>(`${app_config.API_BASE_URL}/api/owner`, profile).subscribe();
    this._profile.set(profile);
  }

  getOwner(): Observable<OwnerProfile> {
    return this.http.get<OwnerProfile>(`${app_config.API_BASE_URL}/api/owner`);
  }
}
