import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillPanel } from './bill-panel';

describe('BillPanel', () => {
  let component: BillPanel;
  let fixture: ComponentFixture<BillPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(BillPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
