import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCategoryComponent } from './booking-category.component';

describe('BookingCategoryComponent', () => {
  let component: BookingCategoryComponent;
  let fixture: ComponentFixture<BookingCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingCategoryComponent]
    });
    fixture = TestBed.createComponent(BookingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
