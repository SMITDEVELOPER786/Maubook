import { Component, OnInit } from '@angular/core';
import {
  CLOUDINARY_FOLDER,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from '../add-properties/add-properties.component';
import { SnacbarService } from 'src/app/services/snack-bar/snacbar.service';
import { AppearanceService } from '../services/appearance.service';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
})
export class AppearanceComponent implements OnInit {
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isDragging = false;
  isLoading = false;

  constructor(
    private appearanceService: AppearanceService,
    private snackBarService: SnacbarService
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      console.log(file);
      console.log(this.selectedFile);

      this.readImage(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.readImage(file);
    }
  }

  readImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(event: Event) {
    event.stopPropagation(); // prevent triggering file select
    this.selectedFile = null;
    this.imagePreview = null;
  }

  uploadSelectedFile() {
    console.log(this.selectedFile);

    if (!this.selectedFile) {
      console.log('not found image');

      return;
    }
    this.isLoading = true;
    const file = this.selectedFile;
    this.uploadToCloudinary(file)
      .then((url) => {
        console.log('Uploaded file URL:', url);
        this.appearanceService.saveLogoUrl(url).then((value) => {
          this.selectedFile = null;
          this.imagePreview = null;
          this.snackBarService.showSuccess('File Uploaded Successfully');
        });
      })
      .catch((error) => {
        console.error('Upload failed:', error);
        this.snackBarService.showSuccess(
          'File uploading failed, please try again'
        );
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  }
}
