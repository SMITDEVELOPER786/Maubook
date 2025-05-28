import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackagesService {

    constructor(private firestore: AngularFirestore) {}

  getPackageCategories(): Observable<string[]> {
  return this.firestore
    .collection<any>('packages')
    .valueChanges()
    .pipe(
      map((packages: any[]) => {
        const categories = packages
          .map(pkg => pkg.category as string)
          .filter(name => !!name); // remove null/undefined/empty

        // Remove duplicates
        return Array.from(new Set(categories));
      })
    );
}
}
