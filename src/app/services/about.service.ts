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
  private faqCollection = this.firestore.collection('faq');
  private privacyCollection = this.firestore.collection('privacy-policy');
  private refundpolicyCollection = this.firestore.collection('refund-policy');
  private termconditionsCollection = this.firestore.collection('term-conditions');
  private servicesCollection = this.firestore.collection('site-config');




  constructor(private firestore: AngularFirestore) {}

  // Fetch 'About Us' content from Firestore
  getAbout(): Observable<any> {
    return this.aboutCollection.doc('aboutUs').valueChanges();
  }

  getContact(): Observable<any> {
    return this.contactCollection.doc('contactInfo').valueChanges();
  }


  getFooter(): Observable<any> {
    return this.servicesCollection.valueChanges();
  }

    getFaq(): Observable<any> {
    return this.faqCollection.doc('faq').valueChanges();
  }

  getprivacypolicy(): Observable<any> {
    return this.privacyCollection.doc('privacy-policy').valueChanges();
  }

   getrefundPolicy(): Observable<any> {
    return this.refundpolicyCollection.doc('refund-policy').valueChanges();
  }

  gettermsandConditions(): Observable<any> {
    return this.termconditionsCollection.doc('term-conditions').valueChanges();
  }

  getService(): Observable<any> {
    return this.serviceCollection.valueChanges();
  }

  // Update 'About Us' content in Firestore
 updateAbout(content: string): Promise<void> {
 return this.firestore.collection('about').doc('aboutUs').set({ content }, { merge: true });

}

}