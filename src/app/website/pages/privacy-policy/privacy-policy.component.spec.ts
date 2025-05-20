import { ComponentFixture, TestBed } from '@angular/core/testing';

import { privacyComponent } from './privacy-policy.component';

describe('privacy-policyComponent', () => {
  let component: privacyComponent;
  let fixture: ComponentFixture<privacyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [privacyComponent]
    });
    fixture = TestBed.createComponent(privacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
