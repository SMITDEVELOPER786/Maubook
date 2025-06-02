import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { Coupon } from '../model/coupon.model';
import { forkJoin, Observable, of } from 'rxjs';
import { Packages } from '../model/packages.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyCouponService {
  constructor(private firestore: AngularFirestore) {}
  async addCoupon(coupon: Coupon): Promise<void> {
    // First, check if a coupon with the same packageId already exists
    const snapshot = await this.firestore
      .collection<Coupon>('property-coupons', (ref_1) =>
        ref_1.where('package', '==', coupon.package)
      )
      .get()
      .toPromise();
    if (snapshot && !snapshot.empty) {
      // A coupon with this packageId already exists
      return Promise.reject(
        new Error('A coupon for this package already exists.')
      );
    }
    // If not found, create a new coupon
    const id = this.firestore.createId();
    return await this.firestore
      .collection('property-coupons')
      .doc(id)
      .set(coupon);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.firestore
      .collection<Coupon>('property-coupons')
      .valueChanges({ idField: 'id' }); // idField ensures the doc ID is included
  }

  deleteCoupon(id: string): Promise<void> {
    return this.firestore.collection('property-coupons').doc(id).delete();
  }

  async updateCoupon(
    id: string,
    updatedCoupon: Partial<Coupon>
  ): Promise<void> {
    // Only check for package conflict if the package is being updated
    if (updatedCoupon.package) {
      const snapshot = await this.firestore
        .collection<Coupon>('property-coupons', (ref) =>
          ref.where('package', '==', updatedCoupon.package)
        )
        .get()
        .toPromise();

      const duplicate = snapshot?.docs.find((doc) => doc.id !== id);
      if (duplicate) {
        return Promise.reject(
          new Error('A coupon for this package already exists.')
        );
      }
    }

    // Proceed with the update if no conflict found
    return this.firestore
      .collection('property-coupons')
      .doc(id)
      .update(updatedCoupon);
  }

  getCouponById(id: string): Observable<Coupon | undefined> {
    return this.firestore
      .collection('property-coupons')
      .doc<Coupon>(id)
      .valueChanges({ idField: 'id' });
  }

  getCouponsPage(
    startAfterCode?: string,
    pageSize?: number
  ): Observable<{ data: Coupon[]; lastDocCode: string | null }> {
    return this.firestore
      .collection<Coupon>('property-coupons', (ref) => {
        let query = ref.orderBy('couponCode').limit(pageSize ?? 10);
        if (startAfterCode) {
          query = query.startAfter(startAfterCode);
        }
        return query;
      })
      .get()
      .pipe(
        switchMap((snapshot) => {
          const coupons = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Coupon[];

          const lastDoc = snapshot.docs[snapshot.docs.length - 1];
          const lastDocCode = lastDoc ? lastDoc.get('couponCode') : null;

          const packageFetches = coupons.map((coupon) => {
            const packageId =
              typeof coupon.package === 'string'
                ? coupon.package
                : (coupon.package as any)?.id;
            if (!packageId) {
              return of({ name: '', image: '', id: '', category: '' });
            }
            return this.firestore
              .collection<Packages>('properties')
              .doc(packageId)
              .get()
              .pipe(
                map((pkgSnap) => {
                  const data = pkgSnap.data() as any;
                  return data
                    ? {
                        id: pkgSnap.id,
                        name: data.name,
                        image: Array.isArray(data.images)
                          ? data.images[0]
                          : data.image,
                        category: data.category,
                      }
                    : { name: '', image: '', id: '', category: '' };
                })
              );
          });

          return forkJoin(packageFetches).pipe(
            map((packageDetails) => {
              const enrichedCoupons: Coupon[] = coupons.map((coupon, i) => ({
                ...coupon,
                packagesDetails: {
                  name: packageDetails[i].name,
                  image: packageDetails[i].image,
                  id: packageDetails[i].id,
                  category: packageDetails[i].category,
                } as any,
              }));
              return { data: enrichedCoupons, lastDocCode };
            })
          );
        })
      );
  }
}
