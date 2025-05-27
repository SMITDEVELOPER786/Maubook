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
  selector: 'app-add-packages',
  templateUrl: './add-evening.component.html',
  styleUrls: ['./add-evening.component.scss']
})
export class AddEveningComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;
  
editId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore,
     private route: ActivatedRoute
  ) {
    this.packageForm = this.fb.group({
      // category: ['', Validators.required],
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
     this.editId = this.route.snapshot.paramMap.get('id');
  if (this.editId) {
    this.loadPackageForEdit(this.editId);
  }
  else{
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

   
  }

  loadPackageForEdit(id: string): void {
  this.firestore.collection('packages').doc(id).get().subscribe(doc => {
    if (doc.exists) {
      const data: any = doc.data();
      this.packageForm.patchValue({
        name: data.name,
        offerText: data.offerText,
        location: data.location,
        description: data.description,
        moreInfo: data.moreInfo,
        tickets: data.tickets || [],
        eventDate: data.eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        chartKey: data.chartKey
      });

      this.selectedFeatures = data.features || [];

      // If tickets exist, clear formArray first
      this.tickets.clear();
      if (data.tickets?.length) {
        data.tickets.forEach((ticket: any) => {
          this.tickets.push(this.fb.group(ticket));
        });
      }

      // Set image previews
      this.selectedImages = (data.images || []).map((url: string) => ({
        file: null as any,
        preview: url
      }));
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

  async onSubmit(): Promise<void> {
  if (this.packageForm.invalid) {
    this.packageForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;

  try {
    const imageUrls = await Promise.all(
      this.selectedImages.map(async image => {
        if (image.file) {
          return await this.uploadToCloudinary(image.file);
        }
        return image.preview;
      })
    );

   const categoryValue = 'evening';

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

const eventDate = this.packageForm.get('eventDate')?.value;
const startTime = this.packageForm.get('startTime')?.value;
const endTime = this.packageForm.get('endTime')?.value;
const chartKey = this.packageForm.get('chartKey')?.value;

if (eventDate) packageData.eventDate = eventDate;
if (startTime) packageData.startTime = startTime;
if (endTime) packageData.endTime = endTime;
if (chartKey) packageData.chartKey = chartKey;
    if (this.editId) {
      // Update
      await this.firestore.collection('packages').doc(this.editId).update(packageData);
      alert('Evening package updated successfully!');
    } else {
      // Add new
      packageData.createdAt = new Date().toISOString();
      await this.firestore.collection('packages').add(packageData);
      alert('Evening package added successfully!');
    }

    this.router.navigate(['/evening']);

  } catch (error) {
    console.error('Error saving package:', error);
    alert(`Failed to save package: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  } finally {
    this.isSubmitting = false;
  }
}


  cancel(): void {
    this.router.navigate(['/packages']);
  }
}
