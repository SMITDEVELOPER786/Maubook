import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  bookingSummary: any = {};
  hotelName: string = '';
  booking: any = {};
  selectedRooms: any[] = [];
  bookingId: string = '';
  discountCode: string = '';
  selectedPaymentMethod: string = '';
  selectedSeat: any = null;

  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
    { id: 'mcb', name: 'MCB JUICE', icon: 'fa-mobile-alt' },
    { id: 'bank', name: 'Bank Transfer', icon: 'fa-university' },
    { id: 'blink', name: 'Blink by Emtel', icon: 'fa-bolt' },
    // { id: 'myt', name: 'my.t money', icon: 'fa-wallet' }
  ];

  constructor(
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // Attempt to get state from navigation
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras.state as {
      bookingSummary?: any;
      hotelName?: string;
      booking?: any;
      selectedRooms?: any[];
      bookingId?: string;
    };

    // If no state from navigation, try to load from localStorage
    if (!state) {
      const savedState = localStorage.getItem('paymentState');
      if (savedState) {
        state = JSON.parse(savedState);
        console.log('Loaded state from localStorage:', state);
      }
    }

    // Handle the state for hotel booking
    if (state && state.bookingSummary && state.hotelName && state.booking && state.selectedRooms && state.bookingId) {
      this.bookingSummary = state.bookingSummary;
      this.hotelName = state.hotelName;
      this.booking = state.booking;
      this.selectedRooms = state.selectedRooms;
      this.bookingId = state.bookingId;
      console.log('Handling hotel booking:', this.bookingSummary);
      
    } else {
      console.warn('No valid booking data found. Redirecting to booking page.');
      alert('No booking data found. Please complete the booking process.');
      this.router.navigate(['/booking']);
    }
  }

  applyDiscount() {
    if (this.discountCode) {
      alert('Discount code applied (placeholder).');
    }
  }

  async processPayment() {
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (!this.bookingId || !this.hotelName || !this.bookingSummary) {
      alert('Incomplete booking data. Please start a new booking.');
      this.router.navigate(['/booking']);
      return;
    }

    const paymentMethod = this.paymentMethods.find(method => method.id === this.selectedPaymentMethod)?.name || 'Not specified';

    try {
      const bookingRef = doc(this.firestore, 'bookings', this.bookingId);
      await updateDoc(bookingRef, {
        paymentMethod: paymentMethod,
        selectedSeat: this.selectedSeat || null,
        bookingType: 'stay' // Set bookingType to 'stay'
      });

      const confirmationState = {
        bookingId: this.bookingId,
        bookingSummary: this.bookingSummary,
        hotelName: this.hotelName,
        booking: this.booking,
        selectedRooms: this.selectedRooms,
        paymentMethod: paymentMethod,
        selectedSeat: this.selectedSeat,
        status: 'Pending'
      };
      localStorage.setItem('confirmationState', JSON.stringify(confirmationState));

      await this.router.navigate(['/confirmation'], {
        state: confirmationState
      });

      // Clean up localStorage
      localStorage.removeItem('paymentState');
      localStorage.removeItem('bookingState');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  }
}