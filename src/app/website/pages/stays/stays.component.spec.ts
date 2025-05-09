import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaysComponent } from './stays.component';

describe('StaysComponent', () => {
  let component: StaysComponent;
  let fixture: ComponentFixture<StaysComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StaysComponent]
    });
    fixture = TestBed.createComponent(StaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
