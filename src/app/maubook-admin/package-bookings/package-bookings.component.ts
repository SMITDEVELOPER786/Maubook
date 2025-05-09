import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';

interface PackageBooking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  guestName: string; // Temporary for editing
  packageName: string;
  ticketName: string;
  quantity: number;
  date: string;
  totalAmount: number;
  status: string;
  phoneNumber?: string;
  paymentMethod?: string;
  note?: string;
  showDetails: boolean;
  isEditing: boolean;
  createdAt?: string; // Added for client-side sorting
}

@Component({
  selector: 'app-package-bookings',
  templateUrl: './package-bookings.component.html',
  styleUrls: ['./package-bookings.component.scss']
})
export class PackageBookingsComponent implements OnInit {
  bookings: PackageBooking[] = [];
  selectedGuest: string = '';
  startDate: string = '';
  endDate: string = '';
  searchQuery: string = '';
  uniqueGuests: string[] = [];
  errorMessage: string = '';

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadBookings();
  }

  async loadBookings() {
    try {
      this.errorMessage = '';
      const bookingsRef = collection(this.firestore, 'bookings');
      let q = query(bookingsRef, where('bookingType', '==', 'package'));

      // Apply Firestore filters only for guest if provided, avoid complex queries
      if (this.selectedGuest) {
        const [firstName, ...lastNameParts] = this.selectedGuest.split(' ');
        q = query(q,
          where('booking.firstName', '==', firstName),
          where('booking.lastName', '==', lastNameParts.join(' '))
        );
      }

      const querySnapshot = await getDocs(q);

      this.bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data['booking']?.firstName || '',
          lastName: data['booking']?.lastName || '',
          email: data['booking']?.email || 'N/A',
          guestName: `${data['booking']?.firstName || ''} ${data['booking']?.lastName || ''}`.trim() || 'N/A',
          packageName: data['packageName'] || 'N/A',
          ticketName: data['bookingSummary']?.tickets[0]?.name || 'N/A',
          quantity: data['bookingSummary']?.tickets[0]?.quantity || 1,
          date: data['bookingSummary']?.checkIn || '',
          totalAmount: data['bookingSummary']?.total || 0,
          status: data['status'] || 'Pending',
          phoneNumber: data['booking']?.phoneNumber || '',
          paymentMethod: data['paymentMethod'] || 'Not specified',
          note: data['booking']?.note || '',
          showDetails: false,
          isEditing: false,
          createdAt: data['createdAt'] || '' // Store for sorting
        };
      });

      // Client-side sorting by createdAt (descending)
      this.bookings.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Client-side filtering for date range
      if (this.startDate || this.endDate) {
        this.bookings = this.bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          const start = this.startDate ? new Date(this.startDate) : null;
          const end = this.endDate ? new Date(this.endDate) : null;
          return (!start || bookingDate >= start) && (!end || bookingDate <= end);
        });
      }

      this.uniqueGuests = [...new Set(
        this.bookings.map(booking => `${booking.firstName} ${booking.lastName}`.trim())
      )].filter(name => name !== '');

      if (this.searchQuery) {
        this.bookings = this.bookings.filter(booking =>
          `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          booking.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          booking.id.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    } catch (error: any) {
      console.error('Error loading package bookings:', error);
      this.errorMessage = 'Failed to load package bookings. Please try again.';
    }
  }

  async applyFilters() {
    if (this.startDate && this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
      this.errorMessage = 'Start date cannot be after end date.';
      return;
    }
    await this.loadBookings();
  }

  async searchBookings() {
    await this.loadBookings();
  }

  exportBookings() {
    const csvContent = [
      ['Booking ID', 'Guest Name', 'Guest Email', 'Package Name', 'Ticket Name', 'Quantity', 'Date', 'Total Amount', 'Status', 'Payment Method'],
      ...this.bookings.map(booking => [
        booking.id,
        `${booking.firstName} ${booking.lastName}`,
        booking.email,
        booking.packageName,
        booking.ticketName,
        booking.quantity,
        booking.date,
        booking.totalAmount,
        booking.status,
        booking.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package-bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  viewBooking(booking: PackageBooking) {
    booking.showDetails = !booking.showDetails;
    booking.isEditing = false;
  }

  editBooking(booking: PackageBooking) {
    booking.isEditing = !booking.isEditing;
    booking.showDetails = booking.isEditing;
    if (booking.isEditing) {
      booking.guestName = `${booking.firstName} ${booking.lastName}`.trim();
    }
  }

  async saveBooking(booking: PackageBooking) {
    if (!booking.email || !booking.totalAmount || !booking.guestName || !booking.packageName || !booking.ticketName || !booking.quantity || !booking.date) {
      this.errorMessage = 'Please fill in all required fields (Guest Name, Email, Package Name, Ticket Name, Quantity, Date, Total Amount).';
      return;
    }
    try {
      const [firstName, ...lastNameParts] = booking.guestName.split(' ');
      const bookingRef = doc(this.firestore, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        booking: {
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: booking.email,
          phoneNumber: booking.phoneNumber || '',
          note: booking.note || ''
        },
        packageName: booking.packageName,
        bookingSummary: {
          checkIn: booking.date,
          tickets: [{
            name: booking.ticketName,
            price: booking.totalAmount / booking.quantity,
            quantity: booking.quantity
          }],
          total: booking.totalAmount
        },
        paymentMethod: booking.paymentMethod,
        status: booking.status
      });
      booking.firstName = firstName || '';
      booking.lastName = lastNameParts.join(' ') || '';
      booking.isEditing = false;
      booking.showDetails = false;
      this.uniqueGuests = [...new Set(
        this.bookings.map(b => `${b.firstName} ${b.lastName}`.trim())
      )].filter(name => name !== '');
      console.log('Package booking updated:', booking.id);
      alert('Package booking updated successfully.');
    } catch (error) {
      console.error('Error updating package booking:', error);
      this.errorMessage = 'Failed to update package booking. Please try again.';
    }
  }

  cancelEdit(booking: PackageBooking) {
    booking.isEditing = false;
    booking.showDetails = false;
    this.loadBookings();
  }

  async deleteBooking(booking: PackageBooking) {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await deleteDoc(bookingRef);
        this.bookings = this.bookings.filter(b => b.id !== booking.id);
        this.uniqueGuests = [...new Set(
          this.bookings.map(b => `${b.firstName} ${b.lastName}`.trim())
        )].filter(name => name !== '');
        console.log('Package booking deleted:', booking.id);
        alert('Package booking deleted successfully.');
      } catch (error) {
        console.error('Error deleting package booking:', error);
        this.errorMessage = 'Failed to delete package booking. Please try again.';
      }
    }
  }

  async acceptBooking(booking: PackageBooking) {
    if (confirm('Are you sure you want to accept this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await updateDoc(bookingRef, { status: 'Confirmed' });
        booking.status = 'Confirmed';
        booking.showDetails = false;
        booking.isEditing = false;
        console.log('Package booking accepted:', booking.id);
        alert('Package booking accepted successfully.');
      } catch (error) {
        console.error('Error accepting package booking:', error);
        this.errorMessage = 'Failed to accept package booking. Please try again.';
      }
    }
  }

  async rejectBooking(booking: PackageBooking) {
    if (confirm('Are you sure you want to reject this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await updateDoc(bookingRef, { status: 'Cancelled' });
        booking.status = 'Cancelled';
        booking.showDetails = false;
        booking.isEditing = false;
        console.log('Package booking rejected:', booking.id);
        alert('Package booking rejected successfully.');
      } catch (error) {
        console.error('Error rejecting package booking:', error);
        this.errorMessage = 'Failed to reject package booking. Please try again.';
      }
    }
  }
}