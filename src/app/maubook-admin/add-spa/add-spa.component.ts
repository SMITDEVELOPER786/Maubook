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
}

@Component({
  selector: 'app-add-packages',
  templateUrl: './add-spa.component.html',
  styleUrls: ['./add-spa.component.scss']
})
export class AddSpaComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  packageForm: FormGroup;
  selectedImages: ImagePreview[] = [];
  selectedFeatures: string[] = [];
  isSubmitting = false;
  spaId: string | null = null; // To hold the ID of the spa being edited


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
    const packageId = this.route.snapshot.paramMap.get('id');
    this.spaId = packageId; // Store the ID for later use
    if (packageId) {
      this.loadPackage(packageId);
    }
    else{
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
   
  }
async loadPackage(id: string) {
  try {
    const doc = await this.firestore.collection('packages').doc(id).get().toPromise();
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
        features?: string[];
        images?: string[];
        tickets?: any[];
      };
      
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

      this.selectedFeatures = data?.features || [];
      this.selectedImages = (data?.images || []).map((url: string) => ({
        file: null,  // no file, only URL
        preview: url
      }));

      // Clear existing tickets and add from data
      this.tickets.clear();
      (data?.tickets || []).forEach((ticket: any) => {
        this.tickets.push(this.fb.group({
          name: [ticket.name, Validators.required],
          price: [ticket.price, [Validators.required, Validators.min(0)]],
          description: [ticket.description]
        }));
      });

    } else {
      alert('Package not found!');
      this.router.navigate(['/spas']);
    }
  } catch (error) {
    console.error('Error loading package:', error);
  }
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

    const categoryValue = 'spa';

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
      updatedAt: new Date().toISOString()
    };

    if (this.spaId) {
      // Edit existing spa
      await this.firestore.collection('packages').doc(this.spaId).update(packageData);
      alert('Spa updated successfully!');
    } else {
      // Add new spa
      packageData.createdAt = new Date().toISOString();
      const docRef = await this.firestore.collection('packages').add(packageData);
      console.log('Document written with ID: ', docRef.id);
      alert('Spa added successfully!');
    }

    this.router.navigate(['/spas']);

  } catch (error) {
    console.error('Error saving spa:', error);
    alert(`Failed to save spa: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  } finally {
    this.isSubmitting = false;
  }
}


  cancel(): void {
    this.router.navigate(['/packages']);
  }
}
