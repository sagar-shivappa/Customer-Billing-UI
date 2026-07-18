import { Injectable, signal } from '@angular/core';
import { OwnerProfile } from '../models/owner.model';

@Injectable({
  providedIn: 'root',
})
export class OwnerProfileService {
  private readonly _profile = signal<OwnerProfile>({
    shopName: '',
    address: '',
    pincode: '',
    gstin: '',
  });

  readonly profile = this._profile.asReadonly();

  saveProfile(profile: OwnerProfile): void {
    this._profile.set(profile);
  }
}
