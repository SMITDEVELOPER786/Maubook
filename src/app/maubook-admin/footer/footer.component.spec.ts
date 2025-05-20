import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponentAdmin } from './footer.component';

describe('AboutComponent', () => {
  let component: FooterComponentAdmin;
  let fixture: ComponentFixture<FooterComponentAdmin>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponentAdmin]
    });
    fixture = TestBed.createComponent(FooterComponentAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
