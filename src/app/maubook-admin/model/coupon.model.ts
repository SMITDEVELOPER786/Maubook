import { Packages } from './packages.model';

export interface Coupon {
  id?: String;
  quantity: number;
  category: string; // or Category if you use objects
  expiryDate: Date; // Firestore Timestamp or Date
  couponCode: string;
  discount: string;
  package: string;
  packagesDetails?: Packages | null;
}
