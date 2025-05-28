import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Coupon } from '../model/coupon.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private firestore: AngularFirestore) {}

  addCoupon(coupon: Coupon): Promise<void> {
  // Use Firestore's auto-generated id for the coupon document
  const id = this.firestore.createId();

  // Add the coupon document under 'coupons' collection
  return this.firestore
    .collection('coupons')
    .doc(id)
    .set(coupon);
}

getCoupons(): Observable<Coupon[]> {
    return this.firestore
      .collection<Coupon>('coupons')
      .valueChanges({ idField: 'id' }); // idField ensures the doc ID is included
  }

}
