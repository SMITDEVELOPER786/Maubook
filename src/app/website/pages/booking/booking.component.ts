  import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
  import { Router } from '@angular/router';
  import { Firestore, collection, addDoc } from '@angular/fire/firestore';
  import { getAuth } from 'firebase/auth';

  interface Guest {
    firstName: string;
    lastName: string;
  }

  interface Room {
    guests: Guest[];
  }

  interface BookingDetails {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    note: string;
    agreedToTerms: boolean;
  }

  @Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss']
  })
  export class BookingComponent implements OnInit, AfterViewInit {
    @ViewChild('timer') timerElement!: ElementRef;

    hotelName: string = '';
    booking: BookingDetails = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      note: '',
      agreedToTerms: false
    };
    selectedRooms: Room[] = [];
    bookingSummary: any = {};
    isPackageCategory: boolean = false; // Flag for package bookings

    constructor(
      private router: Router,
      private firestore: Firestore
    ) {}

    ngOnInit() {
      const navigation = this.router.getCurrentNavigation();
      let state = navigation?.extras.state as {
        bookingSummary: any;
        hotelName: string;
        selectedRoomCount?: number;
        fromPackagePage?: boolean;
        packageId?: string; // Optional property
        amount?: number; // Optional property
        date?: string; // Optional property
        ticketName?: string; // Optional property
        quantity?: number; // Optional property
      };

      if (!state) {
        const savedState = localStorage.getItem('bookingState');
        if (savedState) {
          state = JSON.parse(savedState);
          console.log('Loaded state from local storage:', state);
        }
      }

      if (state && state.fromPackagePage) {
        this.isPackageCategory = true;
        this.bookingSummary = {
          packageId: state.packageId || '',
          amount: state.amount || 0,
          date: state.date || '',
          ticketName: state.ticketName || '',
          quantity: state.quantity || 1
        };
        console.log('Handling package booking data:', this.bookingSummary);
      } else if (state && state.bookingSummary && state.hotelName) {
        this.bookingSummary = state.bookingSummary;
        this.hotelName = state.hotelName;
        const roomCount = state.selectedRoomCount || 1;
        const totalGuestsPerRoom = this.calculateGuestsPerRoom();
        this.selectedRooms = Array(roomCount).fill(null).map(() => ({
          guests: Array(totalGuestsPerRoom).fill(null).map(() => ({
            firstName: '',
            lastName: ''
          }))
        }));
      } else {
        console.warn('No valid booking state found. Redirecting to home.');
        alert('No booking data found. Please start a new booking.');
        this.router.navigate(['/']);
      }
    }

    ngAfterViewInit() {
      this.startTimer(20 * 60); // 20 minutes in seconds
    }

    calculateGuestsPerRoom(): number {
      const { adults = 0, teens = 0, children = 0 } = this.bookingSummary;
      const totalGuests = adults + teens + children;
      const roomCount = this.selectedRooms.length || 1;
      return Math.ceil(totalGuests / roomCount) || 1;
    }

    startTimer(duration: number) {
      let timer = duration, minutes, seconds;
      const interval = setInterval(() => {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;

        if (this.timerElement) {
          this.timerElement.nativeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
          console.warn('Timer element not found');
        }

        if (--timer < 0) {
          clearInterval(interval);
          alert('Time is up! Please complete your booking.');
          localStorage.removeItem('bookingState');
          this.router.navigate(['/']);
        }
      }, 1000);
    }

    async saveBooking() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        const bookingData = {
          userId: user?.uid,
          booking: this.booking,
          hotelName: this.hotelName,
          bookingSummary: this.bookingSummary,
          rooms: this.selectedRooms,
          createdAt: new Date().toISOString(),
          status: 'Pending'
        };

        const bookingsRef = collection(this.firestore, 'bookings');
        const docRef = await addDoc(bookingsRef, bookingData);
        console.log('Booking saved with ID:', docRef.id);
        
        // Clear local storage after successful save
        localStorage.removeItem('bookingState');
        localStorage.removeItem('paymentState');
        localStorage.removeItem('confirmationState');
        
        return docRef.id;
      } catch (error) {
        console.error('Error saving booking:', error);
        return null;
      }
    }

    validateBooking(): boolean {
      if (!this.booking.firstName || !this.booking.lastName || !this.booking.phoneNumber || !this.booking.email) {
        alert('Please fill in all required fields in the booking form.');
        return false;
      }

      for (let i = 0; i < this.selectedRooms.length; i++) {
        for (let j = 0; j < this.selectedRooms[i].guests.length; j++) {
          const guest = this.selectedRooms[i].guests[j];
          if (!guest.firstName || !guest.lastName) {
            alert(`Please fill in all required fields for Guest ${j + 1} in Room ${i + 1}.`);
            return false;
          }
        }
      }

      if (!this.booking.agreedToTerms) {
        alert('Please agree to the terms and conditions.');
        return false;
      }

      return true;
    }

    async proceedToPayment() {
      if (!this.validateBooking()) {
        return;
      }
    
      const bookingId = await this.saveBooking();
      if (!bookingId) {
        alert('Error saving booking. Please try again.');
        return;
      }
    
      const paymentState = {
        bookingSummary: this.bookingSummary,
        hotelName: this.hotelName,
        booking: this.booking,
        selectedRooms: this.selectedRooms,
        bookingId
      };
    
      console.log('Navigating to payment with state:', paymentState); // Debugging line
    
      localStorage.setItem('paymentState', JSON.stringify(paymentState));
    
      this.router.navigate(['/payment'], {
        state: paymentState
      });
    }
  }
