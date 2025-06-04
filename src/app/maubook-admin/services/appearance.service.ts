import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppearanceService {
  private docName = 'A2W4bLp0RxdxKd8KhFmz';

  private logoUrl$: Observable<string | undefined>;

  constructor(private firestore: AngularFirestore) {
    this.logoUrl$ = this.firestore
      .collection('appearance')
      .doc(this.docName)
      .valueChanges()
      .pipe(
        map((data: any) => data?.imageUrl),
        shareReplay(1) // ✅ ensures only one Firestore read is shared
      );
  }

  // Call this in components
  getLogoUrl(): Observable<string | undefined> {
    return this.logoUrl$;
  }

  saveLogoUrl(url: string): Promise<void> {
    return this.firestore
      .collection('appearance')
      .doc(this.docName)
      .set({ imageUrl: url }, { merge: true });
  }
}
