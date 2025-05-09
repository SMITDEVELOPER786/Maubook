import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';

// Simple country code to full name mapping
const COUNTRY_MAP: { [key: string]: string } = {
  'in': 'India',
  'us': 'United States',
  'uk': 'United Kingdom',
  'au': 'Australia',
  'ca': 'Canada',
  // Add more as needed
};

interface User {
  id: string;
  name: string; // Combined firstName and lastName
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCode: string;
  country: string; // Country code (e.g., "in")
  countryFullName: string; // Full country name (e.g., "India")
  address: string;
  town: string;
  zipCode: string;
  dob: string;
  title: string;
  uid: string;
  createdAt: string; // Store as ISO string
  isEditing?: boolean;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  searchQuery: string = '';

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      const usersRef = collection(this.firestore, 'users');
      let q = query(usersRef);

      console.log('Fetching users from Firestore...');
      const querySnapshot = await getDocs(q);
      this.users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User data:', data);
        const firstName = data['firstName'] || '';
        const lastName = data['lastName'] || '';
        const countryCode = data['country'] || '';
        return {
          id: doc.id,
          name: `${firstName} ${lastName}`.trim() || 'N/A',
          firstName,
          lastName,
          email: data['email'] || 'N/A',
          phoneNumber: data['phoneNumber'] || 'N/A',
          phoneCode: data['phoneCode'] || '',
          country: countryCode,
          countryFullName: COUNTRY_MAP[countryCode.toLowerCase()] || countryCode || 'N/A',
          address: data['address'] || 'N/A',
          town: data['town'] || 'N/A',
          zipCode: data['zipCode'] || 'N/A',
          dob: data['dob'] || 'N/A',
          title: data['title'] || 'N/A',
          uid: data['uid'] || 'N/A',
          createdAt: data['createdAt']?.toDate().toISOString() || 'N/A',
          isEditing: false
        };
      });

      // Apply client-side search filter
      if (this.searchQuery) {
        this.users = this.users.filter(user =>
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.phoneNumber.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      console.log('Users loaded:', this.users.length);
    } catch (error: any) {
      console.error('Error loading users:', error, 'Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to load users: ${error.message || 'Unknown error'}. Please try again.`);
    }
  }

  async searchUsers() {
    await this.loadUsers();
  }

  exportUsers() {
    const csvContent = [
      ['No', 'Name', 'Email', 'Phone Code', 'Phone Number', 'Country', 'Address', 'Town', 'Zip Code', 'DOB', 'Title', 'UID', 'Created At'],
      ...this.users.map((user, index) => [
        index + 1,
        user.name,
        user.email,
        user.phoneCode,
        user.phoneNumber,
        user.countryFullName,
        user.address,
        user.town,
        user.zipCode,
        user.dob,
        user.title,
        user.uid,
        user.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  editUser(user: User) {
    user.isEditing = true;
  }

  async saveUser(user: User) {
    if (!user.firstName || !user.lastName || !user.email) {
      alert('First Name, Last Name, and Email are required.');
      return;
    }
    try {
      const userRef = doc(this.firestore, 'users', user.id);
      await updateDoc(userRef, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneCode: user.phoneCode || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        address: user.address || '',
        town: user.town || '',
        zipCode: user.zipCode || '',
        dob: user.dob || '',
        title: user.title || '',
        uid: user.uid
      });
      user.name = `${user.firstName} ${user.lastName}`.trim();
      user.countryFullName = COUNTRY_MAP[user.country.toLowerCase()] || user.country || 'N/A';
      user.isEditing = false;
      console.log(`User ${user.email} updated`);
      alert('User updated successfully.');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  }

  cancelEdit(user: User) {
    user.isEditing = false;
    this.loadUsers();
  }

  async deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        const userRef = doc(this.firestore, 'users', user.id);
        await deleteDoc(userRef);
        this.users = this.users.filter(u => u.id !== user.id);
        console.log(`User ${user.email} deleted`);
        alert('User deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  }
}