import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  // Get all services
  getServices(): Observable<any[]> {
    return this.firestore.collection('services').valueChanges();
  }

  // Add a new service
  addService(service: { name: string }): Promise<any> {
    return this.firestore.collection('services').add(service);
  }

  // Update an existing service
  updateService(id: string, service: { name: string }): Promise<void> {
    return this.firestore.collection('services').doc(id).update(service);
  }

  // Delete a service
  deleteService(id: string): Promise<void> {
    return this.firestore.collection('services').doc(id).delete();
  }
}
