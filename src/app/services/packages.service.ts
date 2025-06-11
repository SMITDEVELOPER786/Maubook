import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { CollectionReference, DocumentData } from 'firebase/firestore';
import {
  Firestore,
  collection,
  collectionData,
  docData,
  doc,
  getDocs,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Packages } from '../model/packages.model';

@Injectable({
  providedIn: 'root',
})
export class PackagesService {
  constructor(
    private firestore: AngularFirestore,
    private firebasefirestore: Firestore
  ) {}

  getPackageCategories(): Observable<string[]> {
    return this.firestore
      .collection<any>('packages')
      .valueChanges()
      .pipe(
        map((packages: any[]) => {
          const categories = packages
            .map((pkg) => pkg.category as string)
            .filter((name) => !!name); // remove null/undefined/empty

          // Remove duplicates
          return Array.from(new Set(categories));
        })
      );
  }

  getPackages(): Observable<Packages[]> {
    return this.firestore
      .collection('packages')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return {
              id,
              name: data.name || '',
              category: data.category,
              image:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images[0]
                  : '',
            };
          })
        )
      );
  }

  getPackagesByCategory(category: string): Observable<Packages[]> {
    return this.firestore
      .collection('packages', (ref) => ref.where('category', '==', category))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return {
              id,
              name: data.name || '',
              category: data.category,
              image:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images[0]
                  : '',
            } as Packages;
          })
        )
      );
  }

  getPackageById(id: string): Observable<Packages | null> {
    return this.firestore
      .collection('packages')
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          const data = snapshot.payload.data() as any;
          if (!data) return null;

          return {
            id,
            name: data.name || '',
            category: data.category,
            image:
              Array.isArray(data.images) && data.images.length > 0
                ? data.images[0]
                : '',
          } as Packages;
        })
      );
  }
}
