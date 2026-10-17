import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerProfileService } from '../../services/owner.service';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { MatCardContent, MatCardHeader, MatCardTitle, MatCard } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PrinterSettingsComponent } from '../printer/printer-settings.component';

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
    MatSlideToggleModule,
    PrinterSettingsComponent,
  ],
  templateUrl: './owner-profile-component.html',
  styleUrl: './owner-profile-component.css',
})
export class OwnerProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ownerProfileService = inject(OwnerProfileService);

  readonly profileForm = this.fb.nonNullable.group({
    shopName: ['', Validators.required],
    address: ['', Validators.required],
    pinCode: ['', Validators.required],
    gstin: [''],

    stockManagement: [false, Validators.required],

    includeGst: [false],

    gstPercentage: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.profileForm.patchValue({
      ...this.ownerProfileService.profile(),
    });

    this.updateGstControlState(this.profileForm.controls.includeGst.value);

    this.profileForm.controls.includeGst.valueChanges.subscribe((includeGst) => {
      this.updateGstControlState(includeGst);
    });

    this.profileForm.markAsPristine();
  }

  private updateGstControlState(includeGst: boolean): void {
    const gstControl = this.profileForm.controls.gstPercentage;

    if (includeGst) {
      gstControl.enable();

      gstControl.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else {
      gstControl.disable();
      gstControl.clearValidators();
      gstControl.setValue(0);
    }

    gstControl.updateValueAndValidity();
  }

  save(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.ownerProfileService.saveProfile(this.profileForm.getRawValue());

    this.profileForm.markAsPristine();
  }
}
