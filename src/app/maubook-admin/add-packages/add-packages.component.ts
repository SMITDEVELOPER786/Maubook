import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dtsngfxmm/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Your Preset Name';
const CLOUDINARY_FOLDER = 'Folder Name';

interface ImagePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-add-packages',
  templateUrl: './add-packages.component.html',
  styleUrls: ['./add-packages.component.scss']
})
export class AddPackagesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    this.packageForm = this.fb.group({
      category: ['', Validators.required],
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

  ngOnInit(): void {
    this.addTicket();

    this.packageForm.get('category')?.valueChanges.subscribe(value => {
      const eventDate = this.packageForm.get('eventDate');
      const startTime = this.packageForm.get('startTime');
      const endTime = this.packageForm.get('endTime');

      if (value === 'events') {
        eventDate?.setValidators([Validators.required]);
        startTime?.setValidators([Validators.required]);
        endTime?.setValidators([Validators.required]);
      } else {
        eventDate?.clearValidators();
        startTime?.clearValidators();
        endTime?.clearValidators();

        eventDate?.reset();
        startTime?.reset();
        endTime?.reset();
      }

      eventDate?.updateValueAndValidity();
      startTime?.updateValueAndValidity();
      endTime?.updateValueAndValidity();
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

  async onSubmit(): Promise<void> {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const imageUrls = await Promise.all(
        this.selectedImages.map(image => this.uploadToCloudinary(image.file))
      );

      const categoryValue = this.packageForm.get('category')?.value;

      const packageData: any = {
        category: categoryValue,
        name: this.packageForm.get('name')?.value,
        offerText: this.packageForm.get('offerText')?.value,
        location: this.packageForm.get('location')?.value,
        description: this.packageForm.get('description')?.value,
        moreInfo: this.packageForm.get('moreInfo')?.value,
        tickets: this.packageForm.get('tickets')?.value,
        features: this.selectedFeatures,
        images: imageUrls,
        createdAt: new Date().toISOString()
      };

      if (categoryValue === 'events') {
  packageData.eventDate = this.packageForm.get('eventDate')?.value;
  packageData.startTime = this.packageForm.get('startTime')?.value;
  packageData.endTime = this.packageForm.get('endTime')?.value;
  packageData.chartKey = this.packageForm.get('chartKey')?.value; // <-- Save it
}

      await this.firestore.collection('packages').add(packageData)
        .then(docRef => {
          console.log('Document written with ID: ', docRef.id);
          alert('Package saved successfully!');
          this.router.navigate(['/admin/packages']);
        })
        .catch(error => {
          console.error('Error adding document: ', error);
          throw error;
        });

    } catch (error) {
      console.error('Error saving package:', error);
      alert(`Failed to save package: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/packages']);
  }
}
