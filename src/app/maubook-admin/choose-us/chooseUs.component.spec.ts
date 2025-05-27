import { ComponentFixture, TestBed } from '@angular/core/testing';
import { chooseUsComponent } from './chooseUs.component';



describe('choose-us', () => {
  let component: chooseUsComponent;
  let fixture: ComponentFixture<chooseUsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [chooseUsComponent]
    });
    fixture = TestBed.createComponent(chooseUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
