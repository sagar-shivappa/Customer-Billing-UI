import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerProfileService } from '../../services/owner.service';
import { MatLabel, MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { MatCardContent, MatCardHeader, MatCardTitle, MatCard } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-owner-profile-component',
  imports: [
    MatLabel,
    MatFormField,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCard,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './owner-profile-component.html',
  styleUrl: './owner-profile-component.css',
})
export class OwnerProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ownerProfileService = inject(OwnerProfileService);

  readonly profileForm = this.fb.nonNullable.group({
    shopName: ['', Validators.required],
    address: ['', Validators.required],
    pincode: ['', Validators.required],
    gstin: [''],
  });
  ngOnInit(): void {
    this.profileForm.patchValue({
      ...this.ownerProfileService.profile(),
    });

    this.profileForm.markAsPristine();
  }

  save(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.ownerProfileService.saveProfile(this.profileForm.getRawValue());

    this.profileForm.markAsPristine();
  }
}
