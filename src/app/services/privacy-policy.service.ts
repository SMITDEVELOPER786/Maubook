import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Import Firestore from AngularFire
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicyService {
  private privacyPolicyDoc = this.firestore.doc('privacyPolicy/1'); // '1' is a placeholder for document ID

  constructor(private firestore: AngularFirestore) {}

  // Fetch the current privacy policy content
  getPrivacyPolicy(): Observable<any> {
    return this.privacyPolicyDoc.valueChanges();
  }

  // Update the privacy policy content
  updatePrivacyPolicy(content: string): Promise<void> {
    return this.privacyPolicyDoc.update({ content }); // Update the content field in Firebase
  }
}
