import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private aboutCollection = this.firestore.collection('about');

  constructor(private firestore: AngularFirestore) {}

  // Fetch 'About Us' content from Firestore
  getAbout(): Observable<any> {
    return this.aboutCollection.doc('aboutUs').valueChanges();
  }

  // Update 'About Us' content in Firestore
 updateAbout(content: string): Promise<void> {
 return this.firestore.collection('about').doc('aboutUs').set({ content }, { merge: true });

}

}
