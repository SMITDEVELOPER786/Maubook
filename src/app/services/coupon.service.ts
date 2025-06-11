import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { Coupon } from '../model/coupon.model';
import { forkJoin, Observable, of } from 'rxjs';
import { Packages } from '../model/packages.model';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private firestore: AngularFirestore) {}

  async addCoupon(coupon: Coupon): Promise<void> {
    // 1. Check if a coupon with the same couponCode already exists
    const codeSnapshot = await this.firestore
      .collection<Coupon>('coupons', (ref) =>
        ref.where('couponCode', '==', coupon.couponCode)
      )
      .get()
      .toPromise();

    if (codeSnapshot && !codeSnapshot.empty) {
      return Promise.reject(
        new Error(
          'This coupon code is already in use. Please try another or auto-generate one.'
        )
      );
    }

    // 2. Check if a coupon with the same package ID already exists
    const packageSnapshot = await this.firestore
      .collection<Coupon>('coupons', (ref) =>
        ref.where('package', '==', coupon.package)
      )
      .get()
      .toPromise();

    if (packageSnapshot && !packageSnapshot.empty) {
      return Promise.reject(
        new Error('A coupon for this package already exists.')
      );
    }

    // 3. All checks passed – Add new coupon
    const id = this.firestore.createId();
    return await this.firestore.collection('coupons').doc(id).set(coupon);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.firestore
      .collection<Coupon>('coupons')
      .valueChanges({ idField: 'id' }); // idField ensures the doc ID is included
  }

  deleteCoupon(id: string): Promise<void> {
    return this.firestore.collection('coupons').doc(id).delete();
  }

  async updateCoupon(
    id: string,
    updatedCoupon: Partial<Coupon>
  ): Promise<void> {
    // Only check for package conflict if the package is being updated
    if (updatedCoupon.package) {
      const snapshot = await this.firestore
        .collection<Coupon>('coupons', (ref) =>
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
              .collection<Packages>('packages')
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
