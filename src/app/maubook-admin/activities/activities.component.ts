import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-packages',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  packages: any[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';

  constructor(
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages() {
    this.firestore.collection('packages').snapshotChanges().subscribe(
      (snapshot) => {
        this.packages = snapshot.map(doc => {
          const data = doc.payload.doc.data() as any;
          const id = doc.payload.doc.id;
          return { id, ...data };
        });
        
       this.packages =   this.packages.filter(pkg => pkg.category?.toLowerCase() === 'activities');

      // Optional: Extract categories if still needed (only "spa" in this case)
      this.categories = [...new Set(this.packages.map(pkg => pkg.category))];
      },
      (error) => {
        console.error('Error loading packages:', error);
      }
    );
  }

  addNewProduct() {
    this.router.navigate(['/add-activities']);
  }

  applyFilters() {
    if (this.selectedCategory) {
      this.firestore.collection('packages', ref => 
        ref.where('category', '==', this.selectedCategory)
      ).snapshotChanges().subscribe(snapshot => {
        this.packages = snapshot.map(doc => {
          const data = doc.payload.doc.data() as any;
          const id = doc.payload.doc.id;
          return { id, ...data };
        });
      });
    } else {
      this.loadPackages();
    }
  }

  searchPackages() {
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.firestore.collection('packages').snapshotChanges().subscribe(snapshot => {
        this.packages = snapshot.map(doc => {
          const data = doc.payload.doc.data() as any;
          const id = doc.payload.doc.id;
          return { id, ...data };
        }).filter(pkg => 
          pkg.name.toLowerCase().includes(query) ||
          pkg.category.toLowerCase().includes(query) ||
          pkg.location.toLowerCase().includes(query)
        );
      });
    } else {
      this.loadPackages();
    }
  }

  editPackage(id: string) {
    this.router.navigate(['/edit-packages', id]);
  }

  async deletePackage(id: string) {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await this.firestore.collection('packages').doc(id).delete();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  }
}
