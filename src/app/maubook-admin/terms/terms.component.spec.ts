import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermConditionComponent } from './terms.component';

describe('AboutComponent', () => {
  let component: TermConditionComponent;
  let fixture: ComponentFixture<TermConditionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermConditionComponent]
    });
    fixture = TestBed.createComponent(TermConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
