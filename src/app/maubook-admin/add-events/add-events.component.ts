import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dkfgfnbst/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'newpresent';
const CLOUDINARY_FOLDER = 'Folder Name';

interface ImagePreview {
  file: File | null;
  preview: string;
  existingUrl?: string; // for already uploaded image
}

@Component({
  selector: 'app-add-packages',
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.scss']
})
export class AddEventsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;
  isEditMode = false;
  eventId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {
    this.packageForm = this.fb.group({
      category: ['events'],
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
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.eventId = id;
        this.loadEventData(id);
      } else {
        this.addTicket();
      }
    });

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

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.secure_url;
  }

  async onSubmit(): Promise<void> {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const uploadedImageUrls = await Promise.all(
        this.selectedImages.map(async img => {
          if (img.file) {
            return await this.uploadToCloudinary(img.file);
          }
          return img.existingUrl || '';
        })
      );

      const formValues = this.packageForm.value;
      const packageData: any = {
        category: formValues.category,
        name: formValues.name,
        offerText: formValues.offerText,
        location: formValues.location,
        description: formValues.description,
        moreInfo: formValues.moreInfo,
        tickets: formValues.tickets,
        features: this.selectedFeatures,
        images: uploadedImageUrls,
        updatedAt: new Date().toISOString()
      };

      if (formValues.category === 'events') {
        packageData.eventDate = formValues.eventDate;
        packageData.startTime = formValues.startTime;
        packageData.endTime = formValues.endTime;
        packageData.chartKey = formValues.chartKey;
      }

      if (this.isEditMode && this.eventId) {
        await this.firestore.collection('packages').doc(this.eventId).update(packageData);
        alert('Event updated successfully!');
      } else {
        packageData.createdAt = new Date().toISOString();
        await this.firestore.collection('packages').add(packageData);
        alert('Event added successfully!');
      }

      this.router.navigate(['/events']);

    } catch (error) {
      console.error('Submit error:', error);
      alert('Error saving event');
    } finally {
      this.isSubmitting = false;
    }
  }

  async loadEventData(id: string): Promise<void> {
    const docRef = this.firestore.collection('packages').doc(id);
    const docSnap = await docRef.get().toPromise();

    if (docSnap && docSnap.exists) {
      const data = docSnap.data() as any;
      this.packageForm.patchValue({
        category: data.category,
        name: data.name,
        offerText: data.offerText,
        location: data.location,
        description: data.description,
        moreInfo: data.moreInfo,
        eventDate: data.eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        chartKey: data.chartKey
      });

      this.tickets.clear();
      if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets.forEach((ticket: any) => {
          this.tickets.push(this.fb.group({
            name: [ticket.name],
            price: [ticket.price],
            description: [ticket.description]
          }));
        });
      }

      this.selectedFeatures = data.features || [];
      this.selectedImages = (data.images || []).map((url: string) => ({
        file: null,
        preview: url,
        existingUrl: url
      }));
    }
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }
}
