import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { db } from '../../app.module';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/Your Folder/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Finfly';
const CLOUDINARY_FOLDER = 'Maubook';
const CLOUDINARY_API_KEY = '893699556445192';

@Component({
  selector: 'app-add-properties',
  templateUrl: './add-properties.component.html',
  styleUrls: ['./add-properties.component.scss']
})
export class AddPropertiesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  propertyForm!: FormGroup;
  selectedImages: { file?: File; preview: string }[] = [];
  roomImages: { file?: File; preview: string }[][] = [];
  removedPropertyImages: string[] = [];
  removedRoomImages: string[][] = [];
  isEditing: boolean = false;
  propertyId: string | null = null;

  featuresList: string[] = [
    'Exclusive', 'All-Inclusive', 'Family Friendly', 'Adults Only',
    'Beachfront', 'Business Center', 'Pet Friendly'
  ];

  popularFacilitiesList: string[] = [
    'Restaurant', 'Swimming Pool', 'Bar', 'Beach Access', 'Spa',
    'Fitness Center', 'Free WiFi', 'Parking', 'Room Service', 'Theater'
  ];

  otherFacilitiesList: string[] = [
    'Airport Shuttle', 'Concierge', 'Currency Exchange', 'Laundry',
    'Meeting Rooms', 'Tennis Court', 'Kids Club', '24/7 Security'
  ];

  roomFacilitiesList: string[] = [
    'Air Conditioning', 'Mini Bar', 'Safe', 'TV',
    'Private Balcony', 'Sea View', 'Bath Tub', 'Shower'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
    const propertyData = history.state.property;
    if (propertyData && history.state.isEditing) {
        console.log('Property data:', propertyData); // Debug log
        this.isEditing = true;
        this.propertyId = propertyData.id;
        setTimeout(() => {
            this.populateForm(propertyData);
        }, 100);
    }
}

  ngOnInit(): void {
      if (!this.isEditing) {
          this.addRoom();
      }
  }

  private createForm() {
    this.propertyForm = this.fb.group({
      region: [''],
      category: [''],
      name: [''],
      location: [''],
      rating: [''],
      features: this.fb.array([]),
      offerText: [''],
      description: [''],
      popularFacilities: this.fb.array([]),
      otherFacilities: this.fb.array([]),
      rooms: this.fb.array([]),
      additionalInfo: [''],
      videoLink: [''],
      price: [''],
      googleMapUrl: ['']
    });
  }

  private populateForm(property: any) {
    // Patch scalar values, providing defaults if undefined
    this.propertyForm.patchValue({
      region: property.region || '',
      category: property.category || '',
      name: property.name || '',
      location: property.location || '',
      rating: property.rating || '',
      offerText: property.offerText || '',
      description: property.description || '',
      additionalInfo: property.additionalInfo || '',
      videoLink: property.videoLink || '',
      googleMapUrl: property.googleMapUrl || '',
      price: property.price || ''
    });

    // Populate features
    const featuresArray = this.propertyForm.get('features') as FormArray;
    featuresArray.clear();
    (property.features || []).forEach((feature: string) => {
      if (this.featuresList.includes(feature)) {
        featuresArray.push(this.fb.control(feature));
      }
    });

    // Populate popular facilities
    const popularFacilitiesArray = this.propertyForm.get('popularFacilities') as FormArray;
    popularFacilitiesArray.clear();
    (property.popularFacilities || []).forEach((facility: string) => {
      if (this.popularFacilitiesList.includes(facility)) {
        popularFacilitiesArray.push(this.fb.control(facility));
      }
    });

    // Populate other facilities
    const otherFacilitiesArray = this.propertyForm.get('otherFacilities') as FormArray;
    otherFacilitiesArray.clear();
    (property.otherFacilities || []).forEach((facility: string) => {
      if (this.otherFacilitiesList.includes(facility)) {
        otherFacilitiesArray.push(this.fb.control(facility));
      }
    });

    // Populate rooms
    const roomsArray = this.propertyForm.get('rooms') as FormArray;
    roomsArray.clear();
    (property.rooms || []).forEach((room: any, index: number) => {
      const roomGroup = this.createRoom();
      roomGroup.patchValue({
        type: room.type || '',
        description: room.description || ''
      });

      // Populate room facilities
      const facilitiesArray = roomGroup.get('facilities') as FormArray;
      (room.facilities || []).forEach((facility: string) => {
        if (this.roomFacilitiesList.includes(facility)) {
          facilitiesArray.push(this.fb.control(facility));
        }
      });

      // Populate room plans
      const plansArray = roomGroup.get('plans') as FormArray;
      (room.plans || []).forEach((plan: any) => {
        plansArray.push(this.fb.group({
          adultCapacity: [plan.adultCapacity || ''],
          teenCapacity: [plan.teenCapacity || ''],
          childCapacity: [plan.childCapacity || ''],
          bedType: [plan.bedType || ''],
          price: [plan.price || '']
        }));
      });

      roomsArray.push(roomGroup);

      // Initialize room images and removed images array
      this.roomImages[index] = (room.images || []).map((url: string) => ({
        preview: url
      }));
      this.removedRoomImages[index] = [];
    });

    // Populate property images
    this.selectedImages = (property.images || []).map((url: string) => ({
      preview: url
    }));
  }

  get rooms() {
    return this.propertyForm.get('rooms') as FormArray;
  }

  createRoom(): FormGroup {
    return this.fb.group({
      type: [''],
      description: [''],
      facilities: this.fb.array([]),
      images: [[]],
      plans: this.fb.array([])
    });
  }

  createPlan(): FormGroup {
    return this.fb.group({
      adultCapacity: [''],
      teenCapacity: [''],
      childCapacity: [''],
      bedType: [''],
      price: ['']
    });
  }

  // In populateForm method, update the plans population:
  getRoomPlans(roomIndex: number): FormArray {
    return this.rooms.at(roomIndex).get('plans') as FormArray;
  }

  addPlan(roomIndex: number) {
    const plans = this.getRoomPlans(roomIndex);
    plans.push(this.createPlan());
  }

  removePlan(roomIndex: number, planIndex: number) {
    const plans = this.getRoomPlans(roomIndex);
    plans.removeAt(planIndex);
  }

  async onSubmit() {
    try {
      // Delete removed images from Cloudinary
      for (const url of this.removedPropertyImages) {
        await this.deleteCloudinaryImage(url);
      }
      for (const roomImages of this.removedRoomImages) {
        for (const url of roomImages) {
          await this.deleteCloudinaryImage(url);
        }
      }

      // Upload new images to Cloudinary
      const propertyImageUrls = await Promise.all(
        this.selectedImages.map(async (img) => {
          if (img.file) {
            return await this.uploadToCloudinary(img.file);
          }
          return img.preview;
        })
      );

      const roomImageUrls = await Promise.all(
        this.roomImages.map(async (roomImgs, index) =>
          Promise.all(
            (roomImgs || []).map(async (img) => {
              if (img.file) {
                return await this.uploadToCloudinary(img.file);
              }
              return img.preview;
            })
          )
        )
      );

      let propertyData = {
        ...this.propertyForm.value,
        images: propertyImageUrls,
        rooms: this.propertyForm.value.rooms.map((room: any, index: number) => ({
          ...room,
          images: roomImageUrls[index] || []
        })),
        updatedAt: new Date()
      };

      if (!this.isEditing) {
        propertyData = {
          ...propertyData,
          createdAt: new Date()
        };
      }

      if (this.isEditing && this.propertyId) {
        const propertyRef = doc(db, 'properties', this.propertyId);
        // Remove createdAt from update data
        const { createdAt, ...updateData } = propertyData;
        await updateDoc(propertyRef, updateData);
      } else {
        const propertiesRef = collection(db, 'properties');
        await addDoc(propertiesRef, propertyData);
      }

      this.router.navigate(['/admin/properties']);
    } catch (error: any) {
      console.error('Error saving property:', error);
      this.showError('Failed to save property. Please try again.');
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

  private showError(message: string) {
    console.error(message);
    // Implement toast/snackbar notification
  }

  addRoom() {
    this.rooms.push(this.createRoom());
    this.roomImages.push([]);
    this.removedRoomImages.push([]);
  }

  removeRoom(index: number) {
    // Track images from the removed room for deletion
    if (this.roomImages[index]) {
      this.removedRoomImages[index].push(...this.roomImages[index].map(img => img.preview));
    }
    this.rooms.removeAt(index);
    this.roomImages.splice(index, 1);
    this.removedRoomImages.splice(index, 1);
  }

  isFeatureSelected(feature: string): boolean {
    const features = this.propertyForm.get('features') as FormArray;
    return features.value.includes(feature);
  }

  toggleFeature(feature: string) {
    const features = this.propertyForm.get('features') as FormArray;
    const index = features.value.indexOf(feature);
    if (index === -1) {
      features.push(this.fb.control(feature));
    } else {
      features.removeAt(index);
    }
  }

  isFacilitySelected(facility: string): boolean {
    const facilities = this.propertyForm.get('popularFacilities') as FormArray;
    return facilities.value.includes(facility);
  }

  toggleFacility(facility: string) {
    const facilities = this.propertyForm.get('popularFacilities') as FormArray;
    const index = facilities.value.indexOf(facility);
    if (index === -1) {
      facilities.push(this.fb.control(facility));
    } else {
      facilities.removeAt(index);
    }
  }

  onOtherFacilityChange(event: any, facility: string) {
    const facilities = this.propertyForm.get('otherFacilities') as FormArray;
    if (event.target.checked) {
      facilities.push(this.fb.control(facility));
    } else {
      const index = facilities.controls.findIndex(x => x.value === facility);
      if (index >= 0) {
        facilities.removeAt(index);
      }
    }
  }

  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') && file.size <= 5000000) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push({ file, preview: e.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          console.error('Invalid file:', file.name);
        }
      }
    }
  }

  onRoomImageSelect(event: any, roomIndex: number) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') && file.size <= 5000000) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            if (!this.roomImages[roomIndex]) this.roomImages[roomIndex] = [];
            this.roomImages[roomIndex].push({ file, preview: e.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          console.error('Invalid room image:', file.name);
        }
      }
    }
  }

  removeRoomImage(roomIndex: number, imageIndex: number) {
    const removed = this.roomImages[roomIndex].splice(imageIndex, 1)[0];
    if (!removed.file && !this.removedRoomImages[roomIndex].includes(removed.preview)) {
      this.removedRoomImages[roomIndex].push(removed.preview);
    }
  }

  removeImage(index: number) {
    const removed = this.selectedImages.splice(index, 1)[0];
    if (!removed.file && !this.removedPropertyImages.includes(removed.preview)) {
      this.removedPropertyImages.push(removed.preview);
    }
  }

  goBack() {
    this.router.navigate(['/admin/properties']);
  }

  private async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  }

  getFacilityIcon(facility: string): string {
    const iconMap: { [key: string]: string } = {
      'Restaurant': 'fas fa-utensils',
      'Swimming Pool': 'fas fa-swimming-pool',
      'Bar': 'fas fa-glass-martini-alt',
      'Beach Access': 'fas fa-umbrella-beach',
      'Spa': 'fas fa-spa',
      'Fitness Center': 'fas fa-dumbbell',
      'Free WiFi': 'fas fa-wifi',
      'Parking': 'fas fa-parking',
      'Room Service': 'fas fa-concierge-bell',
      'Theater': 'fas fa-theater-masks'
    };
    return iconMap[facility] || 'fas fa-star';
  }

  getRoomFacilityIcon(facility: string): string {
    const iconMap: { [key: string]: string } = {
      'Air Conditioning': 'fas fa-snowflake',
      'Mini Bar': 'fas fa-glass-martini',
      'Safe': 'fas fa-lock',
      'TV': 'fas fa-tv',
      'Private Balcony': 'fas fa-door-open',
      'Sea View': 'fas fa-water',
      'Bath Tub': 'fas fa-bath',
      'Shower': 'fas fa-shower'
    };
    return iconMap[facility] || 'fas fa-check';
  }

  isRoomFacilitySelected(facility: string, roomIndex: number): boolean {
    const room = this.rooms.at(roomIndex);
    const facilities = room.get('facilities') as FormArray;
    return facilities.value.includes(facility);
  }

  toggleRoomFacility(facility: string, roomIndex: number) {
    const room = this.rooms.at(roomIndex);
    const facilities = room.get('facilities') as FormArray;
    const index = facilities.value.indexOf(facility);
    if (index === -1) {
      facilities.push(this.fb.control(facility));
    } else {
      facilities.removeAt(index);
    }
  }
}
