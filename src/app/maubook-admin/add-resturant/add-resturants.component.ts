import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dkfgfnbst/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'newpresent';
const CLOUDINARY_FOLDER = 'Folder Name';

interface ImagePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-resturants',
  templateUrl: './add-resturants.component.html',
  styleUrls: ['./add-resturants.component.scss']
})
export class AddResturantComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;
   resturantId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore,
     private route: ActivatedRoute
  ) {
    this.packageForm = this.fb.group({
      category: ['restaurant'],
      name: ['', Validators.required],
      offerText: [''],
      location: [''],
      description: ['', Validators.required],
      moreInfo: [''],
      tickets: this.fb.array([]),
      eventDate: [''],
      startTime: [''],
      endTime: [''],
      chartKey: [''] // <-- Added chartKey field
    });

  }

  async ngOnInit(): Promise<void> {
    this.addTicket();

    // Check if there's an id param for editing
    this.resturantId = this.route.snapshot.paramMap.get('id');

    if (this.resturantId) {
      // Load existing data for editing
      const doc = await this.firestore.collection('packages').doc(this.resturantId).get().toPromise();
      if (doc && doc.exists) {
        const data = doc.data() as {
          name?: string;
          offerText?: string;
          location?: string;
          description?: string;
          moreInfo?: string;
          eventDate?: string;
          startTime?: string;
          endTime?: string;
          chartKey?: string;
          category?: string;
          tickets?: any[];
          features?: string[];
          images?: string[];
        };
        this.packageForm.patchValue({
          name: data?.name,
          offerText: data?.offerText,
          location: data?.location,
          description: data?.description,
          moreInfo: data?.moreInfo,
          eventDate: data?.eventDate || '',
          startTime: data?.startTime || '',
          endTime: data?.endTime || '',
          chartKey: data?.chartKey || '',
          category: data?.category || 'restaurant'
        });

        // Set tickets FormArray
        if (data?.tickets && Array.isArray(data.tickets)) {
          this.tickets.clear();
          data.tickets.forEach((ticket: any) => {
            this.tickets.push(this.fb.group({
              name: ticket.name,
              price: ticket.price,
              description: ticket.description
            }));
          });
        }

        // Set selected features
        this.selectedFeatures = data.features || [];

        // Set images as preview only (no File objects for existing images)
        this.selectedImages = (data.images || []).map((url: string) => ({
          file: null as any, // no actual file, so handle accordingly in upload
          preview: url
        }));
      }
    }

    // Your category valueChanges subscription code...
  }

  get tickets(): FormArray {
    return this.packageForm.get('tickets') as FormArray;
  }

  createTicket(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  addTicket(): void {
    this.tickets.push(this.createTicket());
  }

  removeTicket(index: number): void {
    this.tickets.removeAt(index);
  }

  triggerImageUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onImageSelect(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push({
              file: file,
              preview: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  toggleFeature(feature: string): void {
    const index = this.selectedFeatures.indexOf(feature);
    if (index === -1) {
      this.selectedFeatures.push(feature);
    } else {
      this.selectedFeatures.splice(index, 1);
    }
  }

  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

   async onSubmit(): Promise<void> {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      // Upload new images only, keep old image URLs
      const uploadedImageUrls = await Promise.all(
        this.selectedImages.map(async (image) => {
          if (image.file) {
            return await this.uploadToCloudinary(image.file);
          } else {
            // Already an uploaded image URL (editing existing)
            return image.preview;
          }
        })
      );

      const categoryValue = this.packageForm.get('category')?.value || 'restaurant';

      const packageData: any = {
        category: categoryValue,
        name: this.packageForm.get('name')?.value,
        offerText: this.packageForm.get('offerText')?.value,
        location: this.packageForm.get('location')?.value,
        description: this.packageForm.get('description')?.value,
        moreInfo: this.packageForm.get('moreInfo')?.value,
        tickets: this.packageForm.get('tickets')?.value,
        features: this.selectedFeatures,
        images: uploadedImageUrls,
        updatedAt: new Date().toISOString()
      };

      // If adding new document
      if (!this.resturantId) {
        packageData.createdAt = new Date().toISOString();
        await this.firestore.collection('packages').add(packageData);
        alert('Resturant added successfully!');
      } else {
        // Update existing document
        await this.firestore.collection('packages').doc(this.resturantId).update(packageData);
        alert('Resturant updated successfully!');
      }

      this.router.navigate(['/resturants']);

    } catch (error) {
      console.error('Error saving package:', error);
      alert(`Failed to save Resturant: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/packages']);
  }
}
