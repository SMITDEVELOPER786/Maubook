import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundPolicyComponent } from './refund-policy.component';

describe('RefundPolicyComponent', () => {
  let component: RefundPolicyComponent;
  let fixture: ComponentFixture<RefundPolicyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefundPolicyComponent]
    });
    fixture = TestBed.createComponent(RefundPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
