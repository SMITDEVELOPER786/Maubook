import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private aboutCollection = this.firestore.collection('about');
  private privacyPolicyCollection = this.firestore.collection('privacy-policy');
  private refundPolicyCollection = this.firestore.collection('refund-policy');
  private faqCollection = this.firestore.collection('faq');


 


  constructor(private firestore: AngularFirestore) {}

  // Fetch 'About Us' content from Firestore
  getAbout(): Observable<any> {
    return this.aboutCollection.doc('aboutUs').valueChanges();
  }



  // Update 'About Us' content in Firestore
 updateAbout(content: string): Promise<void> {
 return this.firestore.collection('about').doc('aboutUs').set({ content }, { merge: true });

}
getPrivacyPolicy(): Observable<any> {
   return this.privacyPolicyCollection.doc('privacy-policy').valueChanges();
 
}

updatePrivacyPolicy(content: string): Promise<void> {
 return this.firestore.collection('privacy-policy').doc('privacy-policy').set({ content }, { merge: true });
}

getRefundPrivacyPolicy(): Observable<any> {
   return this.refundPolicyCollection.doc('refund-policy').valueChanges();
 
}

updateRefundPrivacyPolicy(content: string): Promise<void> {
 return this.firestore.collection('refund-policy').doc('refund-policy').set({ content }, { merge: true });
}

getFaq(): Observable<any> {
   return this.faqCollection.doc('faq').valueChanges();
 
}

updateFaq(content: string): Promise<void> {
 return this.firestore.collection('faq').doc('faq').set({ content }, { merge: true });
}


}
