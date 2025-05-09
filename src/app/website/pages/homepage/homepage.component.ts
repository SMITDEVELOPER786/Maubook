import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SwiperCore from 'swiper';
import { Pagination , Navigation, Autoplay} from 'swiper/modules';
import { DatePipe } from '@angular/common';
import { PropertyService } from '../../../services/property.service';

SwiperCore.use([Pagination]);

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  providers: [DatePipe]
})
export class HomepageComponent implements OnInit {
  isDesktop: boolean = true;
  isMobile: boolean = false;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  minDate: Date = new Date();
  numberOfGuests: number = 1;
  guestOptions: number[] = Array.from({ length: 15 }, (_, i) => i + 1);
  mostPickedProperties: any[] = [];

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private propertyService: PropertyService
  ) {
    this.minDate.setHours(0, 0, 0, 0); // Set to start of today
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadRandomProperties();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
    this.isMobile = window.innerWidth <= 768;
  }

  loadRandomProperties(): void {
    this.propertyService.getAllProperties().subscribe(properties => {
      this.mostPickedProperties = this.getRandomProperties(properties, 5);
    });
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/category', category]);
  }

  private getRandomProperties(properties: any[], count: number): any[] {
    const shuffled = properties.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getStars(stars: number): number[] {
    return Array(stars).fill(0);
  }

  search() {
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
    if (this.checkOutDate <= this.checkInDate) {
      alert('Check-out date must be after check-in date.');
      return;
    }
    SwiperCore.use([Navigation, Pagination, Autoplay]);


    const searchParams = {
      checkInDate: this.checkInDate.toISOString(),
      checkOutDate: this.checkOutDate.toISOString(),
      numberOfGuests: this.numberOfGuests
    };
    localStorage.setItem('lastSearch', JSON.stringify(searchParams));

    this.router.navigate(['/stays'], {
      queryParams: {
        checkin: this.datePipe.transform(this.checkInDate, 'yyyy-MM-dd'),
        checkout: this.datePipe.transform(this.checkOutDate, 'yyyy-MM-dd'),
        guests: this.numberOfGuests
      }
    });
  }

  navigateToStays(): void {
    this.router.navigate(['/stays']);
  }

  goToPropertyDetails(property: any): void {
    console.log('Clicked property:', property);
    if (!property) {
      console.error('Property is undefined or null');
      return;
    }

    if (!property._id && !property.id) {
      console.error('Property object has no _id or id:', Object.keys(property));
      return;
    }

    const id = property._id || property.id;
    this.router.navigate(['/property', id]);
  }
}