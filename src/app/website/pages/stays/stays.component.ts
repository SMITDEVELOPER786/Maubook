import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-stays',
  templateUrl: './stays.component.html',
  styleUrls: ['./stays.component.scss'],
  providers: [DatePipe]
})
export class StaysComponent implements OnInit {
  properties: any[] = [];
  allProperties: any[] = [];
  propertyCount: number = 0;
  loading: boolean = true;
  error: string | null = null;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  minDate: Date = new Date();
  numberOfGuests: number = 1;
  guestOptions: number[] = Array.from({ length: 15 }, (_, i) => i + 1);
  searchText: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    this.minDate.setHours(0, 0, 0, 0); // Set to start of today
  }

  ngOnInit() {
    this.loadProperties();
    this.route.queryParams.subscribe(params => {
      if (params['checkin']) {
        this.checkInDate = new Date(params['checkin']);
      }
      if (params['checkout']) {
        this.checkOutDate = new Date(params['checkout']);
      }
      if (params['guests']) {
        this.numberOfGuests = parseInt(params['guests'], 10);
      }
    });
  }

  async loadProperties() {
    try {
      const propertiesRef = collection(this.firestore, 'properties');
      const querySnapshot = await getDocs(propertiesRef);
      this.allProperties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.properties = [...this.allProperties];
      this.propertyCount = this.properties.length;
      this.loading = false;
      // Do not call filterProperties here
    } catch (error) {
      this.error = 'Failed to load properties';
      this.loading = false;
    }
  }

  floor(num: number): number {
    return Math.floor(num);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 !== 0;
  }

  getFullStars(rating: number): number[] {
    return Array(this.floor(rating)).fill(0);
  }

  navigateToPropertyDetails(propertyId: string) {
    this.router.navigate(['/property', propertyId]);
  }

  filterProperties() {
    let filtered = this.allProperties;
    const text = this.searchText.trim().toLowerCase();
    if (text) {
      filtered = filtered.filter(property =>
        (property.name && property.name.toLowerCase().includes(text)) ||
        (property.description && property.description.toLowerCase().includes(text))
      );
    }
    if (this.minPrice !== null) {
      filtered = filtered.filter(property => (property.rooms?.[0]?.roomPrice ?? 0) >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(property => (property.rooms?.[0]?.roomPrice ?? 0) <= this.maxPrice!);
    }
    this.properties = filtered;
  }

  searchProperties() {
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
    if (this.checkOutDate <= this.checkInDate) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    const formattedCheckin = this.datePipe.transform(this.checkInDate, 'yyyy-MM-dd');
    const formattedCheckout = this.datePipe.transform(this.checkOutDate, 'yyyy-MM-dd');
console.log("test")
    const searchParams = {
      checkInDate: this.checkInDate.toISOString(),
      checkOutDate: this.checkOutDate.toISOString(),
      numberOfGuests: this.numberOfGuests
    };
    localStorage.setItem('lastSearch', JSON.stringify(searchParams));

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        checkin: formattedCheckin,
        checkout: formattedCheckout,
        guests: this.numberOfGuests
      },
      queryParamsHandling: 'merge'
    });
    // Do not call filterProperties here
  }

  resetFilters() {
    this.searchText = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.checkInDate = null;
    this.checkOutDate = null;
    this.numberOfGuests = 1;
    this.properties = [...this.allProperties];
  }
}