import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTransactions } from './report-transactions';

describe('ReportTransactions', () => {
  let component: ReportTransactions;
  let fixture: ComponentFixture<ReportTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTransactions],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTransactions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
