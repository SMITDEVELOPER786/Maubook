import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-category-packages',
  templateUrl: './category-packages.component.html',
  styleUrls: ['./category-packages.component.scss']
})
export class CategoryPackagesComponent implements OnInit {
  packages: any[] = [];
  category: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['category'];
      this.loadPackages();
    });
  }

  loadPackages() {
    this.loading = true;
    this.firestore.collection('packages', ref => 
      ref.where('category', '==', this.category)
    ).snapshotChanges().subscribe(snapshot => {
      this.packages = snapshot.map(doc => {
        const data = doc.payload.doc.data() as any;
        return { id: doc.payload.doc.id, ...data };
      });
      this.loading = false;
    });
  }

  getFeatureIcon(feature: string): string {
    return 'fa-check';  // Always return check icon
  }

  formatFeature(feature: string): string {
    // Convert camelCase to space-separated and uppercase
    return feature
      .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
      .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
      .trim()
      .toUpperCase();
  }

  capitalizeFirstLetter(text: string): string {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

  selectedDate: Date = new Date();

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    // Handle date change here
    console.log('Selected date:', event.value);
  }
}