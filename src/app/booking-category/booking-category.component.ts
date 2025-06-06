import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

declare var seatsio: any; // Declare seatsio for TypeScript

interface BookingDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  note: string;
  agreedToTerms: boolean;
}

@Component({
  selector: 'app-booking-category',
  templateUrl: './booking-category.component.html',
  styleUrls: ['./booking-category.component.scss']
})
export class BookingCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('timer') timerElement!: ElementRef;

  packageName: string = '';
  booking: BookingDetails = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    note: '',
    agreedToTerms: false
  };
  bookingSummary: any = {};
  isPackageCategory: boolean = true;
  errorMessage: string = '';
  selectedSeats: string[] = [];
  seatError: string = '';
  chartError: string = '';
  seatsioChart: any;

  constructor(private router: Router, private firestore: Firestore) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras.state as {
      packageId?: string;
      packageName?: string;
      amount?: number;
      date?: string;
      ticketName?: string;
      ticketPrice?: number;
      quantity?: number;
      fromPackagePage?: boolean;
    };

    if (!state || !state.fromPackagePage) {
      const storedState = localStorage.getItem('bookingState');
      if (storedState) {
        try {
          state = JSON.parse(storedState);
          console.log('Retrieved state from localStorage:', state);
        } catch (e) {
          console.error('Error parsing localStorage booking state:', e);
        }
      }
    }

    if (state && state.fromPackagePage) {
      this.isPackageCategory = true;
      this.packageName = state.packageName || 'Package Booking';
      this.bookingSummary = {
        type: 'package',
        packageId: state.packageId,
        title: state.packageName,
        total: state.amount,
        checkIn: state.date ? new Date(state.date).toISOString().split('T')[0] : null,
        tickets: [{
          name: state.ticketName,
          price: state.ticketPrice,
          quantity: state.quantity
        }]
      };
      console.log('Handling package booking data:', this.bookingSummary);
    } else {
      console.warn('No valid package booking state found. Redirecting to home.');
      alert('No booking data found. Please start a new booking.');
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    this.startTimer(20 * 60);
    this.initializeSeatsioChart();
  }

  initializeSeatsioChart() {
    const ticketName = this.bookingSummary.tickets[0].name;
    const maxSeats = this.bookingSummary.tickets[0].quantity;

    try {
      this.seatsioChart = new seatsio.SeatingChart({
        divId: 'chart',
        workspaceKey: 'e9d2f374-94be-b-b892-6ef6008ec83c', // Your public workspace key
        event: 'd489a70f-d9b1-4a13-16934ea1e9a3', // Replace with actual event key from Seats.io dashboard
        region: 'eu', // Confirmed from preview link
        pricing: [
          { category: 'VIP', price: this.bookingSummary.tickets[0].name === 'VIP' ? this.bookingSummary.tickets[0].price : 0 },
          { category: 'ORDINARY', price: this.bookingSummary.tickets[0].name === 'ORDINARY' ? this.bookingSummary.tickets[0].price : 0 }
        ],
        maxSelectedObjects: maxSeats,
        availableCategories: [ticketName],
        onObjectSelected: (object: any) => {
          this.selectedSeats.push(object.label);
          this.seatError = '';
          if (this.selectedSeats.length > maxSeats) {
            this.seatError = `You can only select ${maxSeats} seat(s).`;
            this.seatsioChart.deselect(object.label);
            this.selectedSeats.pop();
          }
        },
        onObjectDeselected: (object: any) => {
          this.selectedSeats = this.selectedSeats.filter(label => label !== object.label);
          this.seatError = '';
        },
        onSelectionValid: () => {
          this.seatError = '';
        },
        onSelectionInvalid: (errors: any) => {
          this.seatError = errors.length > 0 ? 'Invalid seat selection. Please try again.' : '';
        },
        onChartRenderingFailed: (error: any) => {
          console.error('Seats.io chart rendering failed:', error);
          this.chartError = 'Failed to load seating chart. Please try again or contact support.';
        }
      }).render();
    } catch (error) {
      console.error('Error initializing Seats.io chart:', error);
      this.chartError = 'Failed to load seating chart. Please check your configuration.';
    }
  }

  isBookingValid(): boolean {
    return (
      this.booking.agreedToTerms &&
      this.booking.firstName.trim() !== '' &&
      this.booking.lastName.trim() !== '' &&
      this.booking.phoneNumber.trim() !== '' &&
      this.booking.email.trim() !== '' &&
      this.selectedSeats.length === this.bookingSummary.tickets[0].quantity
    );
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
        localStorage.removeItem('bookingState');
        alert('Time is up! Please complete your booking.');
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  async proceedToPayment() {
    this.errorMessage = '';
    this.seatError = '';
    this.chartError = '';

    if (!this.isBookingValid()) {
      if (this.selectedSeats.length !== this.bookingSummary.tickets[0].quantity) {
        this.seatError = `Please select exactly ${this.bookingSummary.tickets[0].quantity} seat(s).`;
      }
      if (!this.booking.agreedToTerms) {
        this.errorMessage = 'Please agree to the terms and conditions.';
      }
      if (!this.booking.firstName.trim() || !this.booking.lastName.trim() || !this.booking.phoneNumber.trim() || !this.booking.email.trim()) {
        this.errorMessage = 'Please fill in all required fields.';
      }
      return;
    }

    const bookingId = `PKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const bookingData = {
      bookingType: 'package',
      booking: {
        firstName: this.booking.firstName,
        lastName: this.booking.lastName,
        email: this.booking.email,
        phoneNumber: this.booking.phoneNumber,
        note: this.booking.note || ''
      },
      packageName: this.packageName,
      bookingSummary: {
        checkIn: this.bookingSummary.checkIn,
        tickets: [{
          name: this.bookingSummary.tickets[0].name,
          price: this.bookingSummary.tickets[0].price,
          quantity: this.bookingSummary.tickets[0].quantity,
          selectedSeats: this.selectedSeats
        }],
        total: this.bookingSummary.total
      },
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      const bookingsRef = collection(this.firestore, 'bookings');
      const docRef = await addDoc(bookingsRef, bookingData);
      console.log('Booking saved to Firestore with ID:', docRef.id);

      const confirmationState = {
        bookingId: docRef.id,
        bookingSummary: this.bookingSummary,
        bookingType: 'package',
        packageName: this.packageName,
        booking: this.booking,
        paymentMethod: 'Bank Transfer',
        selectedSeats: this.selectedSeats
      };

      localStorage.setItem('confirmationState', JSON.stringify(confirmationState));

      console.log('Navigating to confirmation with state:', confirmationState);

      this.router.navigate(['/confirmation'], {
        state: confirmationState
      });

      localStorage.removeItem('bookingState');
    } catch (error) {
      console.error('Error saving booking to Firestore:', error);
      this.errorMessage = 'Failed to save booking. Please try again.';
    }
  }
}