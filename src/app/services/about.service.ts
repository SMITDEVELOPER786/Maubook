import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private aboutCollection = this.firestore.collection('about');
  private contactCollection = this.firestore.collection('contact');
  private serviceCollection = this.firestore.collection('services');



  constructor(private firestore: AngularFirestore) {}

  // Fetch 'About Us' content from Firestore
  getAbout(): Observable<any> {
    return this.aboutCollection.doc('aboutUs').valueChanges();
  }

  getContact(): Observable<any> {
    return this.contactCollection.doc('contactInfo').valueChanges();
  }

  getService(): Observable<any> {
    return this.serviceCollection.valueChanges();
  }

  // Update 'About Us' content in Firestore
 updateAbout(content: string): Promise<void> {
 return this.firestore.collection('about').doc('aboutUs').set({ content }, { merge: true });

}

}