import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Packages } from '../../model/packages.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  constructor(private firestore: AngularFirestore) {}

  // Fetch all properties from Firestore
  getAllProperties(): Observable<any[]> {
    return this.firestore
      .collection('properties')
      .valueChanges({ idField: 'id' });
  }

  // Fetch a single property by ID
  getPropertyById(id: string): Observable<any> {
    return this.firestore.collection('properties').doc(id).valueChanges();
  }

  getAllPropertiesAsPackages(): Observable<Packages[]> {
    return this.firestore
      .collection('properties')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return {
              id,
              name: data.name || '',
              image:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images[0]
                  : '',
              category: data.category || '',
            } as Packages;
          })
        )
      );
  }

  getPropertiesByCategory(category: string): Observable<Packages[]> {
    return this.firestore
      .collection('properties', (ref) => ref.where('category', '==', category))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return {
              id,
              name: data.name || '',
              image:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images[0]
                  : '',
              category: data.category || '',
            } as Packages;
          })
        )
      );
  }

  getAllPropertyCategories(): Observable<string[]> {
    return this.firestore
      .collection('property-category')
      .valueChanges()
      .pipe(map((categories: any[]) => categories.map((cat) => cat.name)));
  }
}
