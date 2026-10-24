import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerAuthorization } from './owner-authorization';

describe('OwnerAuthorization', () => {
  let component: OwnerAuthorization;
  let fixture: ComponentFixture<OwnerAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerAuthorization],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerAuthorization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
