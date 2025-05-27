import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dkfgfnbst/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'newpresent';
const CLOUDINARY_FOLDER = 'Folder Name';

interface ImagePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'add-activities',
  templateUrl: './add-activities.component.html',
  styleUrls: ['./add-activities.component.scss']
})
export class AddActivitiesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;
  editMode = false;
  docId: string | null = null;  // Store document ID when editing

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,  // To get route params
    private firestore: AngularFirestore
  ) {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      offerText: [''],
      location: [''],
      description: ['', Validators.required],
      moreInfo: [''],
      tickets: this.fb.array([]),
      eventDate: [''],
      startTime: [''],
      endTime: [''],
      chartKey: ['']
    });
  }

  ngOnInit(): void {
    this.addTicket();

    // Check if 'id' param exists to enable edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.docId = id;
        this.loadActivityData(id);
      }
    });
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

  // Load existing activity data to form (for editing)
  async loadActivityData(id: string) {
    const doc = await this.firestore.collection('packages').doc(id).get().toPromise();
    if (doc && doc.exists) {
      const data: any = doc.data();

      // Reset tickets and populate from data
      this.tickets.clear();
      if (data?.tickets?.length) {
        data.tickets.forEach((ticket: any) => {
          this.tickets.push(this.fb.group({
            name: [ticket.name, Validators.required],
            price: [ticket.price, [Validators.required, Validators.min(0)]],
            description: [ticket.description]
          }));
        });
      } else {
        this.addTicket();
      }

      // Populate form fields
      this.packageForm.patchValue({
        name: data?.name || '',
        offerText: data?.offerText || '',
        location: data?.location || '',
        description: data?.description || '',
        moreInfo: data?.moreInfo || '',
        eventDate: data?.eventDate || '',
        startTime: data?.startTime || '',
        endTime: data?.endTime || '',
        chartKey: data?.chartKey || ''
      });

      // Populate features
      this.selectedFeatures = data?.features || [];

      // For images: you can only set preview URLs for existing images
      this.selectedImages = (data?.images || []).map((url: string) => ({
        file: null as any,  // no file object for existing images
        preview: url
      }));
    } else {
      alert('Document not found!');
      this.router.navigate(['/activities']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      // Upload new images only (files which have a 'file' object)
      const newImages = this.selectedImages.filter(img => img.file);
      const existingImages = this.selectedImages.filter(img => !img.file).map(img => img.preview);

      const uploadedUrls = await Promise.all(
        newImages.map(image => this.uploadToCloudinary(image.file))
      );

      const allImageUrls = [...existingImages, ...uploadedUrls];

      const categoryValue = 'activities';

      const packageData: any = {
        category: categoryValue,
        name: this.packageForm.get('name')?.value,
        offerText: this.packageForm.get('offerText')?.value,
        location: this.packageForm.get('location')?.value,
        description: this.packageForm.get('description')?.value,
        moreInfo: this.packageForm.get('moreInfo')?.value,
        tickets: this.packageForm.get('tickets')?.value,
        features: this.selectedFeatures,
        images: allImageUrls,
        updatedAt: new Date().toISOString()
      };

      if (this.editMode && this.docId) {
        // Update existing document
        await this.firestore.collection('packages').doc(this.docId).update(packageData);
        alert('Activity updated successfully!');
      } else {
        // Add new document
        packageData.createdAt = new Date().toISOString();
        await this.firestore.collection('packages').add(packageData);
        alert('Activity saved successfully!');
      }

      this.router.navigate(['/activities']);

    } catch (error) {
      console.error('Error saving package:', error);
      alert(`Failed to save Activity: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/activities']);
  }
}
