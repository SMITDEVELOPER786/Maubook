import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../app.module';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface GuestOption {
  display: string;
  adults: number;
  children: number;
  teens: number;
  totalCapacity: number;
}

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss']
})
export class PropertyDetailsComponent implements AfterViewInit {
  today: string = new Date().toISOString().split('T')[0];
  showError: boolean = false;

  @ViewChild('roomsSection') roomsSection!: ElementRef;

  property: any = {};
  checkInDate: string = '';
  checkOutDate: string = '';
  selectedPlan: any = null;

  mainSwiperConfig = {
    slidesPerView: 1,
    navigation: true,
    pagination: { clickable: true },
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    }
  };

  guestOptions: GuestOption[] = [
    { display: '1 Adult', adults: 1, children: 0, teens: 0, totalCapacity: 1 },
    { display: '2 Adults', adults: 2, children: 0, teens: 0, totalCapacity: 2 },
    { display: '2 Adults, 1 Child', adults: 2, children: 1, teens: 0, totalCapacity: 3 },
    { display: '2 Adults, 2 Children', adults: 2, children: 2, teens: 0, totalCapacity: 4 },
    { display: '2 Adults, 1 Teen', adults: 2, children: 0, teens: 1, totalCapacity: 3 },
    { display: '3 Adults', adults: 3, children: 0, teens: 0, totalCapacity: 3 }
  ];

  selected_guest_option: GuestOption = this.guestOptions[0];

  roomSwiperConfig = {
    slidesPerView: 1,
    navigation: true,
    pagination: { clickable: true },
    loop: true
  };

  roomOptions: number[] = [1, 2, 3, 4, 5];
  selectedRoomCount: number = 1;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // Ensure rooms section is available
  }

  async ngOnInit() {
    const propertyId = this.route.snapshot.params['id'];
    if (propertyId) {
      await this.loadPropertyDetails(propertyId);
    }
  }

  private async loadPropertyDetails(propertyId: string) {
    try {
      const docRef = doc(db, 'properties', propertyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const popularFacilities = (data['popularFacilities'] || []).map((facility: string) => ({
          name: facility,
          icon: this.getFacilityIcon(facility)
        }));
        const otherFacilities = (data['otherFacilities'] || []).map((facility: string) => ({
          name: facility,
          icon: this.getFacilityIcon(facility)
        }));

        this.property = {
          id: docSnap.id,
          ...data,
          popularFacilities,
          otherFacilities,
          safeGoogleMapUrl: this.sanitizer.bypassSecurityTrustResourceUrl(data['googleMapUrl'] || '')
        };
      } else {
        console.error('Property not found');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      this.router.navigate(['/']);
    }
  }

  getFacilityIcon(facility: string): string {
    const iconMap: { [key: string]: string } = {
      'WIFI': 'fas fa-wifi',
      'Air Conditioning': 'fas fa-snowflake',
      'TV': 'fas fa-tv',
      'Mini Bar': 'fas fa-glass-martini-alt',
      'Safe': 'fas fa-lock',
      'Shower': 'fas fa-shower',
      'Bathtub': 'fas fa-bath',
      'Private Pool': 'fas fa-swimming-pool',
      'Restaurant': 'fas fa-utensils',
      'Bar': 'fas fa-glass-martini',
      'Spa': 'fas fa-spa',
      'Fitness Center': 'fas fa-dumbbell',
      'Free WiFi': 'fas fa-wifi',
      'Parking': 'fas fa-parking',
      'Room Service': 'fas fa-concierge-bell',
      'Beach Access': 'fas fa-umbrella-beach',
      'Laundry': 'fas fa-washing-machine',
      'Business Center': 'fas fa-briefcase',
      'Airport Shuttle': 'fas fa-shuttle-van',
      'Garden': 'fas fa-leaf'
    };
    return iconMap[facility] || 'fas fa-concierge-bell';
  }

  checkAndScrollToRooms() {
    if (!this.checkInDate || !this.checkOutDate || !this.selected_guest_option || !this.selectedRoomCount) {
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 3000);
      return;
    }

    this.showError = false;
    this.scrollToRooms();
  }

  scrollToRooms() {
    this.roomsSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  checkAuthAndBook(room: any, plan: any) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, proceed with booking
        this.bookRoom(room, plan);
      } else {
        // User is not logged in
        alert('Please log in to make a booking');
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }
    });
  }

  bookRoom(room: any, plan: any) {
    this.selectedPlan = plan;

    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (this.selected_guest_option.totalCapacity > plan.capacity) {
      alert(`This plan only accommodates ${plan.capacity} guests`);
      return;
    }

    // Prepare booking summary
    const bookingSummary = {
      hotelName: this.property.name || 'Unknown Hotel',
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      nights: this.calculateNights(),
      rooms: this.selectedRoomCount,
      adults: this.selected_guest_option.adults,
      teens: this.selected_guest_option.teens,
      children: this.selected_guest_option.children,
      propertyType: this.property.category || 'Unknown',
      region: this.property.region || 'Unknown',
      roomCategory: room.type || 'Unknown',
      plan: {
        name: plan.name || 'Standard Plan',
        price: plan.price || 0,
        bedType: plan.bedType || 'Unknown',
        adultCapacity: plan.adultCapacity || 0,
        teenCapacity: plan.teenCapacity || 0,
        childCapacity: plan.childCapacity || 0
      },
      total: this.calculateTotalPrice(plan)
    };

    // Log state for debugging
    console.log('Navigating to booking with state:', {
      bookingSummary,
      hotelName: this.property.name,
      selectedRoomCount: this.selectedRoomCount
    });

    // Save to local storage as a fallback
    localStorage.setItem('bookingState', JSON.stringify({
      bookingSummary,
      hotelName: this.property.name,
      selectedRoomCount: this.selectedRoomCount
    }));

    // Navigate to booking page
    this.router.navigate(['/booking'], {
      state: {
        bookingSummary,
        hotelName: this.property.name,
        selectedRoomCount: this.selectedRoomCount
      }
    });
  }

  calculateNights(): number {
    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1; // Ensure at least 1 night
  }

  calculateTotalPrice(plan: any): number {
    if (!this.checkInDate || !this.checkOutDate || !plan.price) return 0;
    const nights = this.calculateNights();
    return plan.price * nights * this.selectedRoomCount;
  }

  showRoomDetails(room: any) {
    console.log('Showing details for room:', room.type);
  }
}