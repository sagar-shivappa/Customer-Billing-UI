import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCare } from './customer-care';

describe('CustomerCare', () => {
  let component: CustomerCare;
  let fixture: ComponentFixture<CustomerCare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCare],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
