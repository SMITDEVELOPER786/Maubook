import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaComponent } from './spa.component';

describe('PackagesComponent', () => {
  let component: SpaComponent;
  let fixture: ComponentFixture<SpaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpaComponent]
    });
    fixture = TestBed.createComponent(SpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
