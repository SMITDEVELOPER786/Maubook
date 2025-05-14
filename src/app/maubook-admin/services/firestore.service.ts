import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

interface Service {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  // Get all services with IDs
  getServices(): Observable<any[]> {
    return this.firestore.collection('services').snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data()  as Service; ;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
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
    console.log("Deleting service with ID:", id);
    return this.firestore.collection('services').doc(id).delete();
  }
}
