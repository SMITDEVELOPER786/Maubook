import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  bookingSummary: any = {};
  bookingId: string = '';
  hotelName: string = '';
  booking: any = {};
  selectedRooms: any[] = [];
  paymentMethod: string = '';
  selectedSeat: any = null;
  status: string = '';
  customerEmail: string = '';
  customerName: string = '';
  customerPhone: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Attempt to get state from navigation
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras.state as {
      bookingSummary?: any;
      hotelName?: string;
      booking?: any;
      selectedRooms?: any[];
      bookingId?: string;
      paymentMethod?: string;
      selectedSeat?: any;
      status?: string;
    };

    // If no state from navigation, try to load from localStorage
    if (!state) {
      const savedState = localStorage.getItem('confirmationState');
      if (savedState) {
        try {
          state = JSON.parse(savedState);
          console.log('Loaded state from local storage:', state);
        } catch (error) {
          console.error('Error parsing confirmationState:', error);
        }
      }
    }

    // Handle the state
    if (state && state.bookingSummary && state.hotelName && state.booking && state.selectedRooms && state.bookingId && state.paymentMethod && state.status) {
      this.bookingSummary = state.bookingSummary;
      this.hotelName = state.hotelName;
      this.booking = state.booking;
      this.selectedRooms = state.selectedRooms;
      this.bookingId = state.bookingId;
      this.paymentMethod = state.paymentMethod;
      this.selectedSeat = state.selectedSeat || null;
      this.status = state.status;
      this.customerEmail = state.booking?.email || 'N/A';
      this.customerName = `${state.booking?.firstName || ''} ${state.booking?.lastName || ''}`.trim() || 'N/A';
      this.customerPhone = state.booking?.phoneNumber || 'N/A';
      console.log('Handling confirmation data:', this.bookingSummary);
    } else {
      console.warn('No valid confirmation data found. Redirecting to booking page.');
      alert('No booking confirmation data found. Please complete the booking process.');
      this.router.navigate(['/booking']);
    }
  }

  sendWhatsAppProof() {
    const whatsappNumber = '+230XXXXXXXX'; // Replace with your actual WhatsApp number
    const message = `Hi, I would like to send payment proof for booking ID: ${this.bookingId}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  openHelpChat() {
    const helpUrl = `https://wa.me/+230XXXXXXXX?text=Hi, I need help with my booking ID: ${this.bookingId}`;
    window.open(helpUrl, '_blank');
  }

  completeBooking() {
    localStorage.removeItem('confirmationState');
    this.router.navigate(['/']);
  }
}