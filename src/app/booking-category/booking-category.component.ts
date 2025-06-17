import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../website/payment/payment.component';

declare var seatsio: any; // Declare seatsio for TypeScript

interface BookingDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  note: string;
  agreedToTerms: boolean;
  userUid: string;
}

@Component({
  selector: 'app-booking-category',
  templateUrl: './booking-category.component.html',
  styleUrls: ['./booking-category.component.scss']
})
export class BookingCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('timer') timerElement!: ElementRef;

  packageName: string = '';
  category: string='';
  booking: BookingDetails = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    note: '',
    userUid: '',
    agreedToTerms: false
  };
  bookingSummary: any = {};
  isPackageCategory: boolean = true;
  errorMessage: string = '';
  selectedSeats: string[] = [];
  seatError: string = '';
  chartError: string = '';

  seatsioChart: any;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Load user details from localStorage
    this.loadUserDetails();
    
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras.state as {
      packageId?: string;
      packageName?: string;
      discount?: string;
      discountAmount?: number;
      amount?: number;
      date?: string;
      ticketName?: string;
      ticketPrice?: number;
      quantity?: number;
      fromPackagePage?: boolean;
    };

    if (!state || !state.fromPackagePage) {
      const storedState = localStorage.getItem('bookingState');
      console.log(storedState)

      if (storedState) {
        try {
          state = JSON.parse(storedState);
          this.category = JSON.parse(storedState)["category"];
       
          console.log('Retrieved state from localStorage:', state);
        } catch (e) {
          console.error('Error parsing localStorage booking state:', e);
        }
      }
    }

    if (state && state.fromPackagePage) {
      this.isPackageCategory = true;
      this.packageName = state.packageName || 'Package Booking';
      console.log(state)
      this.bookingSummary = {
        type: 'package',
        packageId: state.packageId,
        title: state.packageName,
        total: state.amount,
        discount: state.discount,
        discountAmount: state.discountAmount,
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
  const isEvent = this.category === 'events';

  return (
    this.booking.agreedToTerms &&
    this.booking.firstName.trim() !== '' &&
    this.booking.lastName.trim() !== '' &&
    this.booking.phoneNumber.trim() !== '' &&
    this.booking.email.trim() !== '' &&
    (!isEvent || this.selectedSeats.length === this.bookingSummary.tickets[0].quantity)
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

    // Save user details to localStorage
    this.saveUserDetails();

    // First open payment method selection dialog
    const paymentState = {
      bookingSummary: this.bookingSummary,
      bookingType: 'package',
      packageName: this.packageName,
      booking: this.booking,
      selectedSeats: this.selectedSeats
    };

    // Open payment method selection dialog
    const dialogRef = this.dialog.open(PaymentComponent, {
      width: '800px',
      data: paymentState
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.bookingSubmitted) {
        // Generate booking ID after payment method is selected
        const bookingId = `PKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const bookingData = {
          bookingType: 'package',
          booking: {
            firstName: this.booking.firstName,
            lastName: this.booking.lastName,
            email: result.verifiedEmail || this.booking.email,
            phoneNumber: this.booking.phoneNumber,
            note: this.booking.note || '',
            userUid: this.booking.userUid
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
          paymentMethod: result.paymentMethod,
          bankDetails: result.bankDetails,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };

        try {
          const bookingsRef = collection(this.firestore, 'bookings');
          const docRef = await addDoc(bookingsRef, bookingData);
          console.log('Booking saved to Firestore with ID:', docRef.id);

          // Handle the payment result
          const confirmationState = {
            ...paymentState,
            bookingId: docRef.id,
            paymentMethod: result.paymentMethod,
            bankDetails: result.bankDetails,
            verifiedEmail: result.verifiedEmail,
            status: 'Pending'
          };

          localStorage.setItem('confirmationState', JSON.stringify(confirmationState));
          this.router.navigate(['/confirmation'], {
            state: confirmationState
          });

        } catch (error) {
          console.error('Error saving booking to Firestore:', error);
          this.errorMessage = 'Failed to save booking. Please try again.';
        }
      }
    });
  }

  // Method to save user details to localStorage
  saveUserDetails() {
    const userDetails = {
      firstName: this.booking.firstName,
      email: this.booking.email,
      userUid: this.booking.userUid
    };
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  }

  // Method to load user details from localStorage
  loadUserDetails() {

    const email = localStorage.getItem('userEmail');
    const userUid = localStorage.getItem('userUID');
    const firstName = localStorage.getItem('userFirstName');
    if (email) {
      try {
        this.booking.firstName = firstName|| '';
        this.booking.email =email|| '';
        this.booking.userUid =userUid || '';
      } catch (e) {
        console.error('Error parsing user details from localStorage:', e);
      }
    }
  }

  // Method to clear user details from localStorage
  clearUserDetails() {
    localStorage.removeItem('userDetails');
  }
}