import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { AuthService } from '../../services/auth.service';

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
  selectedSeats: any[] = [];
  status: string = '';
  customerEmail: string = '';
  customerName: string = '';
  customerPhone: string = '';
  bankDetails: any = {};
  bookingType: string = '';
  packageName: string = '';
  verifiedEmail: string = '';
  tickets: any[] = [];

  constructor(
    private router: Router,
    private emailService: EmailService,
    private authService: AuthService
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
      paymentMethod?: string;
      selectedSeat?: any;
      selectedSeats?: any[];
      status?: string;
      bankDetails?: any;
      bookingType?: string;
      packageName?: string;
      verifiedEmail?: string;
      tickets?: any[];
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

    // Handle the state - updated to handle the new data structure
    if (state) {
      this.bookingSummary = state.bookingSummary || {};
      this.hotelName = state.hotelName || state.packageName || 'N/A';
      this.booking = state.booking || {};
      this.selectedRooms = state.selectedRooms || [];
      this.bookingId = state.bookingId || '';
      this.paymentMethod = state.paymentMethod || '';
      this.selectedSeat = state.selectedSeat || null;
      this.selectedSeats = state.selectedSeats || [];
      this.status = state.status || '';
      this.bankDetails = state.bankDetails || {};
      this.bookingType = state.bookingType || '';
      this.packageName = state.packageName || '';
      this.verifiedEmail = state.verifiedEmail || '';
      this.tickets = state.bookingSummary.tickets || [];
      
      // Set customer details
      this.customerEmail = state.booking?.email || state.verifiedEmail || 'N/A';
      this.customerName = `${state.booking?.firstName || ''} ${state.booking?.lastName || ''}`.trim() || 'N/A';
      this.customerPhone = state.booking?.phoneNumber || 'N/A';
      
     
      console.log('Handling confirmation data:', {
        bookingSummary: this.bookingSummary,
        booking: this.booking,
        bankDetails: this.bankDetails,
        bookingType: this.bookingType,
        packageName: this.packageName
      });
    } else {
      console.warn('No valid confirmation data found. Redirecting to booking page.');
      alert('No booking confirmation data found. Please complete the booking process.');
      // this.router.navigate(['/booking']);
    }

    // Get the logged-in user's email
    const loggedInEmail = this.authService.getUserEmail();

    // Only send if not already sent and user is logged in
    if (loggedInEmail && !localStorage.getItem('confirmationEmailSent')) {
      this.sendBookingConfirmationEmail(loggedInEmail);
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

  sendBookingConfirmationEmail(userEmail: string) {
    const bookingData = {
      bookingId: this.bookingId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      bookingSummary: this.bookingSummary,
      bankDetails: this.bankDetails,
      bookingType: this.bookingType,
      packageName: this.packageName,
      tickets: this.tickets,
      paymentMethod: this.paymentMethod,
      status: this.status,
      verifiedEmail: this.verifiedEmail
    };

    const emailData = {
      to: userEmail, // Use the logged-in user's email
      subject: `Booking Confirmation - HT-${this.bookingId}`,
      htmlContent: this.emailService.generateBookingEmailHTML(bookingData),
      bookingData: bookingData
    };

    this.emailService.sendBookingConfirmationEmail(emailData)
      .then((response) => {
        localStorage.setItem('confirmationEmailSent', 'true');
        console.log('Booking confirmation email sent successfully', response);
        // Optionally show a toast or alert
      })
      .catch((error: any) => {
        console.error('Error sending booking confirmation email:', error);
        // Optionally show a toast or alert
      });
  }
}