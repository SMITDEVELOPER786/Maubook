import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading: boolean = true;
  startDate: string = '';
  endDate: string = '';
  searchQuery: string = '';

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadUserBookings();
  }

  async loadUserBookings() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error('No user logged in');
        return;
      }

      const bookingsRef = collection(this.firestore, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      this.bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        showDetails: false
      }));

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.isLoading = false;
    }
  }

  viewBooking(booking: any) {
    booking.showDetails = !booking.showDetails;
  }

  applyFilters() {
    // Implement date filtering logic
  }

  searchBookings() {
    // Implement search logic
  }
}