import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPackagesComponent } from './category-packages.component';

describe('CategoryPackagesComponent', () => {
  let component: CategoryPackagesComponent;
  let fixture: ComponentFixture<CategoryPackagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryPackagesComponent]
    });
    fixture = TestBed.createComponent(CategoryPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
