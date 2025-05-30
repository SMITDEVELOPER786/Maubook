export interface Coupon {
  id?: String;
  quantity: number;
  category: string; // or Category if you use objects
  expiryDate: any; // Firestore Timestamp or Date
  couponCode: string;
  discount: string;
}
