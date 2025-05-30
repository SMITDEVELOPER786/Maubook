import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Coupon } from '../model/coupon.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private firestore: AngularFirestore) {}

  addCoupon(coupon: Coupon): Promise<void> {
    // Use Firestore's auto-generated id for the coupon document
    const id = this.firestore.createId();

    // Add the coupon document under 'coupons' collection
    return this.firestore.collection('coupons').doc(id).set(coupon);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.firestore
      .collection<Coupon>('coupons')
      .valueChanges({ idField: 'id' }); // idField ensures the doc ID is included
  }

  deleteCoupon(id: string): Promise<void> {
    return this.firestore.collection('coupons').doc(id).delete();
  }

  updateCoupon(id: string, updatedCoupon: Partial<Coupon>): Promise<void> {
    return this.firestore.collection('coupons').doc(id).update(updatedCoupon);
  }

  getCouponById(id: string): Observable<Coupon | undefined> {
    return this.firestore
      .collection('coupons')
      .doc<Coupon>(id)
      .valueChanges({ idField: 'id' });
  }

  getCouponsPage(
    startAfterCode?: string,
    pageSize?: number
  ): Observable<{ data: Coupon[]; lastDocCode: string | null }> {
    return this.firestore
      .collection<Coupon>('coupons', (ref) => {
        let query = ref.orderBy('couponCode').limit(pageSize ?? 10); // You can change this field to expiryDate
        if (startAfterCode) {
          query = query.startAfter(startAfterCode);
        }
        return query;
      })
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Coupon)
          );

          const lastDoc = snapshot.docs[snapshot.docs.length - 1];
          const lastDocCode = lastDoc ? lastDoc.get('couponCode') : null;

          return { data, lastDocCode };
        })
      );
  }
}
