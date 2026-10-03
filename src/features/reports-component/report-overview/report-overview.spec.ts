import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOverview } from './report-overview';

describe('ReportOverview', () => {
  let component: ReportOverview;
  let fixture: ComponentFixture<ReportOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
