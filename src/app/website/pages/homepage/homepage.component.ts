import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SwiperCore, { Pagination, Navigation, Autoplay } from 'swiper';

import { AboutService } from 'src/app/services/about.service';
import { DatePipe } from '@angular/common';
import { PropertyService } from '../../../services/property.service';

SwiperCore.use([Pagination, Navigation, Autoplay]);


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
  chooseUs: any[] = [];


  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private propertyService: PropertyService,
    private aboutService: AboutService
  ) {
    this.minDate.setHours(0, 0, 0, 0); // Set to start of today
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadRandomProperties();
    this.getChooseUs();
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
  features = [
  {
    icon: 'fas fa-credit-card',
    title: 'Payment methods',
    description: 'We have a lot of them, from cryptocurrencies to barter for potatoes'
  },
  {
    icon: 'fas fa-search',
    title: 'Simple search process',
    description: 'We checked it out, even the kid did it, but it was my mom\'s friend\'s son'
  },
  {
    icon: 'fas fa-headset',
    title: '24/7 Support',
    description: 'Is there something you don\'t understand? Feel free to call us.'
  },
  {
    icon: 'fas fa-heart',
    title: 'We are nice',
    description: 'Fantasy is over, there will be something really convincing here'
  }
];

getChooseUs(){
   this.aboutService.getChooseUs().subscribe((intro: any) => {
      console.log(intro!["items"]["items"]);
      this.chooseUs=intro!["items"]["items"]
      // this.loading=false;
      

    });
}


  search() {
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
    this.checkInDate = new Date(this.checkInDate);
    this.checkOutDate = new Date(this.checkOutDate); 
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