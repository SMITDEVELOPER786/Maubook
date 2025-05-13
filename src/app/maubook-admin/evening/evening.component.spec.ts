import { ComponentFixture, TestBed } from '@angular/core/testing';

import { eveningComponent } from './evening.component';

describe('PackagesComponent', () => {
  let component: eveningComponent;
  let fixture: ComponentFixture<eveningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [eveningComponent]
    });
    fixture = TestBed.createComponent(eveningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
