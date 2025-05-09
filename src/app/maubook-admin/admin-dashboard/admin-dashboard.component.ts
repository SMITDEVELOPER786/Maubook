import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  totalBookings: number = 0;
  totalProperties: number = 0; // Changed from totalStays
  totalUsers: number = 0;
  totalPackages: number = 0;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadStatistics();
  }

  async loadStatistics() {
    try {
      // Fetch total bookings
      const bookingsRef = collection(this.firestore, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      this.totalBookings = bookingsSnapshot.size;

      // Fetch total properties (changed from stays)
      const propertiesRef = collection(this.firestore, 'properties'); // Changed from 'stays'
      const propertiesSnapshot = await getDocs(propertiesRef);
      this.totalProperties = propertiesSnapshot.size; // Changed from totalStays

      // Fetch total users
      const usersRef = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      this.totalUsers = usersSnapshot.size;

      // Fetch total packages
      const packagesRef = collection(this.firestore, 'packages');
      const packagesSnapshot = await getDocs(packagesRef);
      this.totalPackages = packagesSnapshot.size;

      console.log('Statistics loaded:', {
        totalBookings: this.totalBookings,
        totalProperties: this.totalProperties, // Changed from totalStays
        totalUsers: this.totalUsers,
        totalPackages: this.totalPackages
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      alert('Failed to load statistics. Please try again.');
    }
  }
}
