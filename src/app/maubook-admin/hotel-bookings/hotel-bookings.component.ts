import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';

interface Guest {
  firstName: string;
  lastName: string;
}

interface Room {
  guests: Guest[];
}

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  guestName: string; // Temporary for editing
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  phoneNumber?: string;
  roomCategory?: string;
  rooms: Room[]; // Array of rooms with guests
  roomsLength?: number; // For editing number of rooms
  nights?: number; // Number of nights
  adults?: number;
  teens?: number;
  children?: number;
  planPrice?: number;
  paymentMethod?: string;
  note?: string;
  showDetails: boolean;
  isEditing: boolean;
}

@Component({
  selector: 'app-hotel-bookings',
  templateUrl: './hotel-bookings.component.html',
  styleUrls: ['./hotel-bookings.component.scss']
})
export class HotelBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  selectedGuest: string = '';
  startDate: string = '';
  endDate: string = '';
  searchQuery: string = '';
  uniqueGuests: string[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadBookings();
  }

  async loadBookings() {
    try {
      const bookingsRef = collection(this.firestore, 'bookings');
      let q = query(bookingsRef, where('bookingType', '==', 'stay'));

      if (this.selectedGuest) {
        const [firstName, ...lastNameParts] = this.selectedGuest.split(' ');
        q = query(q,
          where('booking.firstName', '==', firstName),
          where('booking.lastName', '==', lastNameParts.join(' '))
        );
      }
      if (this.startDate) {
        q = query(q, where('bookingSummary.checkIn', '>=', this.startDate));
      }
      if (this.endDate) {
        q = query(q, where('bookingSummary.checkOut', '<=', this.endDate));
      }

      const querySnapshot = await getDocs(q);

      this.bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const rooms = data['rooms'] || [];
        return {
          id: doc.id,
          firstName: data['booking']?.firstName || '',
          lastName: data['booking']?.lastName || '',
          email: data['booking']?.email || 'N/A',
          guestName: `${data['booking']?.firstName || ''} ${data['booking']?.lastName || ''}`.trim() || 'N/A',
          propertyName: data['hotelName'] || 'N/A',
          checkIn: data['bookingSummary']?.checkIn || '',
          checkOut: data['bookingSummary']?.checkOut || '',
          totalAmount: data['bookingSummary']?.total || 0,
          status: data['status'] || 'Pending',
          phoneNumber: data['booking']?.phoneNumber || '',
          roomCategory: data['bookingSummary']?.roomCategory || '',
          rooms: rooms.map((room: any) => ({
            guests: room.guests.map((guest: any) => ({
              firstName: guest.firstName || '',
              lastName: guest.lastName || ''
            }))
          })),
          roomsLength: rooms.length,
          nights: data['bookingSummary']?.nights || 0,
          adults: data['bookingSummary']?.adults || 0,
          teens: data['bookingSummary']?.teens || 0,
          children: data['bookingSummary']?.children || 0,
          planPrice: data['bookingSummary']?.plan?.price || 0,
          paymentMethod: data['paymentMethod'] || 'Not specified',
          note: data['booking']?.note || '',
          showDetails: false,
          isEditing: false
        };
      });

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
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings. Please try again.');
    }
  }

  async applyFilters() {
    if (this.startDate && this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
      alert('Start date cannot be after end date.');
      return;
    }
    await this.loadBookings();
  }

  async searchBookings() {
    await this.loadBookings();
  }

  exportBookings() {
    const csvContent = [
      ['Booking ID', 'Guest Name', 'Guest Email', 'Property', 'Check In', 'Check Out', 'Guests', 'Nights', 'Total Amount', 'Status', 'Payment Method'],
      ...this.bookings.map(booking => [
        booking.id,
        `${booking.firstName} ${booking.lastName}`,
        booking.email,
        booking.propertyName,
        booking.checkIn,
        booking.checkOut,
        (booking.adults || 0) + (booking.teens || 0) + (booking.children || 0),
        booking.nights || 'N/A',
        booking.totalAmount,
        booking.status,
        booking.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  viewBooking(booking: Booking) {
    booking.showDetails = !booking.showDetails;
    booking.isEditing = false;
  }

  editBooking(booking: Booking) {
    booking.isEditing = !booking.isEditing;
    booking.showDetails = booking.isEditing;
    if (booking.isEditing) {
      booking.guestName = `${booking.firstName} ${booking.lastName}`.trim();
      booking.roomsLength = booking.rooms.length;
    }
  }

  async saveBooking(booking: Booking) {
    if (!booking.email || !booking.totalAmount || !booking.guestName) {
      alert('Please fill in all required fields (Guest Name, Email, Total Amount).');
      return;
    }
    for (let room of booking.rooms) {
      for (let guest of room.guests) {
        if (!guest.firstName || !guest.lastName) {
          alert('Please fill in all guest names.');
          return;
        }
      }
    }
    try {
      const [firstName, ...lastNameParts] = booking.guestName.split(' ');
      let updatedRooms = booking.rooms;
      if (booking.roomsLength && booking.roomsLength !== booking.rooms.length) {
        updatedRooms = Array(booking.roomsLength).fill(null).map((_, i) => {
          if (i < booking.rooms.length) {
            return booking.rooms[i];
          }
          return { guests: [{ firstName: '', lastName: '' }] };
        });
      }
      const bookingRef = doc(this.firestore, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        booking: {
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: booking.email,
          phoneNumber: booking.phoneNumber || '',
          note: booking.note || ''
        },
        rooms: updatedRooms,
        bookingSummary: {
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          roomCategory: booking.roomCategory || '',
          rooms: updatedRooms.length,
          nights: booking.nights || 0,
          adults: booking.adults || 0,
          teens: booking.teens || 0,
          children: booking.children || 0,
          plan: { price: booking.planPrice || 0 },
          total: booking.totalAmount
        },
        paymentMethod: booking.paymentMethod
      });
      booking.firstName = firstName || '';
      booking.lastName = lastNameParts.join(' ') || '';
      booking.rooms = updatedRooms;
      booking.isEditing = false;
      booking.showDetails = false;
      this.uniqueGuests = [...new Set(
        this.bookings.map(b => `${b.firstName} ${b.lastName}`.trim())
      )].filter(name => name !== '');
      console.log('Booking updated:', booking.id);
      alert('Booking updated successfully.');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  }

  cancelEdit(booking: Booking) {
    booking.isEditing = false;
    booking.showDetails = false;
    this.loadBookings();
  }

  async deleteBooking(booking: Booking) {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await deleteDoc(bookingRef);
        this.bookings = this.bookings.filter(b => b.id !== booking.id);
        this.uniqueGuests = [...new Set(
          this.bookings.map(b => `${b.firstName} ${b.lastName}`.trim())
        )].filter(name => name !== '');
        console.log('Booking deleted:', booking.id);
        alert('Booking deleted successfully.');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  }

  async acceptBooking(booking: Booking) {
    if (confirm('Are you sure you want to accept this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await updateDoc(bookingRef, { status: 'Confirmed' });
        booking.status = 'Confirmed';
        booking.showDetails = false;
        booking.isEditing = false;
        console.log('Booking accepted:', booking.id);
        alert('Booking accepted successfully.');
      } catch (error) {
        console.error('Error accepting booking:', error);
        alert('Failed to accept booking. Please try again.');
      }
    }
  }

  async rejectBooking(booking: Booking) {
    if (confirm('Are you sure you want to reject this booking?')) {
      try {
        const bookingRef = doc(this.firestore, 'bookings', booking.id);
        await updateDoc(bookingRef, { status: 'Cancelled' });
        booking.status = 'Cancelled';
        booking.showDetails = false;
        booking.isEditing = false;
        console.log('Booking rejected:', booking.id);
        alert('Booking rejected successfully.');
      } catch (error) {
        console.error('Error rejecting booking:', error);
        alert('Failed to reject booking. Please try again.');
      }
    }
  }
}