import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProducts } from './report-products';

describe('ReportProducts', () => {
  let component: ReportProducts;
  let fixture: ComponentFixture<ReportProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportProducts],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
