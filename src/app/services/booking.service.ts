import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private temporaryBooking: any;

  setTemporaryBooking(bookingData: any) {
    this.temporaryBooking = bookingData;
  }

  getTemporaryBooking() {
    return this.temporaryBooking;
  }

  clearTemporaryBooking() {
    this.temporaryBooking = null;
  }
}