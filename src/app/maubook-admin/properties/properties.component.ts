import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../app.module';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dtsngfxmm/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Finfly';
const CLOUDINARY_API_KEY = '893699556865192';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  properties: any[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  categories: string[] = ['beach', 'golf', 'city', 'cottages', 'guesthouses', 'villa', 'apartment'];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProperties();
  }

  async loadProperties() {
    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      this.properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Properties loaded:', this.properties);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  addNewProperty() {
    this.router.navigate(['/add-properties']);
  }

  async editProperty(propertyId: string) {
    try {
      const propertyToEdit = this.properties.find(p => p.id === propertyId);
      
      if (propertyToEdit) {
        // Ensure all necessary data is included
        const navigationExtras: NavigationExtras = {
          state: {
            property: {
              id: propertyToEdit.id,
              ...propertyToEdit
            },
            isEditing: true
          }
        };
        
        await this.router.navigate(['/add-properties'], navigationExtras);
      } else {
        console.error('Property not found:', propertyId);
      }
    } catch (error) {
      console.error('Error navigating to edit form:', error);
    }
  }

  async deleteProperty(propertyId: string) {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        const propertyToDelete = this.properties.find(p => p.id === propertyId);
        
        if (propertyToDelete.images) {
          for (const imageUrl of propertyToDelete.images) {
            await this.deleteCloudinaryImage(imageUrl);
          }
        }

        if (propertyToDelete.rooms) {
          for (const room of propertyToDelete.rooms) {
            if (room.images) {
              for (const imageUrl of room.images) {
                await this.deleteCloudinaryImage(imageUrl);
              }
            }
          }
        }

        await deleteDoc(doc(db, 'properties', propertyId));
        this.properties = this.properties.filter(prop => prop.id !== propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  }

  private async deleteCloudinaryImage(imageUrl: string) {
    try {
      const publicId = this.getPublicIdFromUrl(imageUrl);
      const timestamp = new Date().getTime();
      const formData = new FormData();
      
      formData.append('public_id', publicId);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch('https://api.cloudinary.com/v1_1/dtsngfxmm/image/destroy', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${publicId}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  private getPublicIdFromUrl(url: string): string {
    const matches = url.match(/\/maubook\/([^/]+)\./);
    return matches ? `maubook/${matches[1]}` : '';
  }

  applyFilters() {
    // Implement category filtering logic
  }

  searchProperties() {
    // Implement search logic
  }
}