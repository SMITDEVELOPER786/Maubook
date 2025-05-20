import { ComponentFixture, TestBed } from '@angular/core/testing';

import { termComponent } from './term-conditions';

describe('privacy-policyComponent', () => {
  let component: termComponent;
  let fixture: ComponentFixture<termComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [termComponent]
    });
    fixture = TestBed.createComponent(termComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
