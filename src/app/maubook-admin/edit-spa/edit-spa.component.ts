import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { SpaService } from 'src/app/services/spa.service';

@Component({
  selector: 'app-edit-spa',
  templateUrl: './edit-spa.component.html',
  styleUrls: ['./edit-spa.component.scss']
})
export class EditSpaComponent implements OnInit {
  spaForm!: FormGroup;
  packages: any[] = [];
  spaId: string | undefined;
  firestore: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.spaId = this.route.snapshot.paramMap.get('id') || '';
    this.spaForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      price: [0, Validators.required],
      description: [''],
      image: [''],
      duration: [''],
      isActive: [true]
    });

    this.loadSpaData();
  }

  loadSpaData() {
  if (!this.spaId) return;

  this.firestore.collection('packages').doc(this.spaId).get().subscribe(
    (doc: any) => {
      if (doc.exists) {
        const data = doc.data();

        // Patch the form with the existing data
        this.spaForm.patchValue({
          name: data.name || '',
          category: data.category || '',
          location: data.location || '',
          price: data.tickets?.[0]?.price || 0,
          description: data.description || '',
          image: data.images?.[0] || '',
          duration: data.duration || '',
          isActive: data.isActive ?? true
        });
      } else {
        console.warn('No spa found with given ID.');
      }
    },
    (error: any) => {
      console.error('Error fetching spa:', error);
    }
  );
}

  onSubmit() {
    if (this.spaForm.valid && this.spaId) {
    this.firestore.collection('packages').doc(this.spaId).update(this.spaForm.value)
      .then(() => {
        alert('Spa updated successfully');
        this.router.navigate(['/']);
      })
      .catch((error: any) => {
        console.error('Error updating spa:', error);
        alert('Failed to update spa.');
      });
  }
}
}
