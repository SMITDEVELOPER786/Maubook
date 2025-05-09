import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor(private firestore: AngularFirestore) {}

  // Fetch all properties from Firestore
  getAllProperties(): Observable<any[]> {
    return this.firestore.collection('properties').valueChanges({ idField: 'id' });
  }

  // Fetch a single property by ID
  getPropertyById(id: string): Observable<any> {
    return this.firestore.collection('properties').doc(id).valueChanges();
  }
}
