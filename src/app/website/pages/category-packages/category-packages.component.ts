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
  allPackages: any[] = [];
  searchText: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

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
      this.allPackages = snapshot.map(doc => {
        const data = doc.payload.doc.data() as any;
        console.log(data);
        return { id: doc.payload.doc.id, ...data };
      });
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters() {
    this.packages = this.allPackages.filter(pkg => {
      // Text search (title, description, location)
      const text = this.searchText.trim().toLowerCase();
      let matchesText = true;
      if (text) {
        matchesText = (
          (pkg.name && pkg.name.toLowerCase().includes(text)) ||
          (pkg.description && pkg.description.toLowerCase().includes(text)) ||
          (pkg.location && pkg.location.toLowerCase().includes(text))
        );
      }
      // Price filter (min/max on tickets[0].price)
      let matchesPrice = true;
      if (pkg.tickets && pkg.tickets.length > 0) {
        const price = Number(pkg.tickets[0].price);
        if (this.minPrice !== null && price < this.minPrice) matchesPrice = false;
        if (this.maxPrice !== null && price > this.maxPrice) matchesPrice = false;
      }
      return matchesText && matchesPrice;
    });
  }

  resetFilters() {
    this.searchText = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
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
}