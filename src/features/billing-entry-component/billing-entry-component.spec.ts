import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingEntryComponent } from './billing-entry-component';

describe('BillingEntryComponent', () => {
  let component: BillingEntryComponent;
  let fixture: ComponentFixture<BillingEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingEntryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingEntryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
