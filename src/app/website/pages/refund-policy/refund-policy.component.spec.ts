import { ComponentFixture, TestBed } from '@angular/core/testing';

import { refundComponent } from './refund-policy.component';

describe('privacy-policyComponent', () => {
  let component: refundComponent;
  let fixture: ComponentFixture<refundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [refundComponent]
    });
    fixture = TestBed.createComponent(refundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
