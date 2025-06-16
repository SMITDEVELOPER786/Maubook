import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CardSelectionComponent } from './card-selection/card-selection.component';
import { AppearanceService } from '../../services/appearance.service';
import { BankInfo } from '../../model/bank.info.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  bookingSummary: any = {};
  hotelName: string = '';
  booking: any = {};
  selectedRooms: any[] = [];
  bookingId: string = '';
  discountCode: string = '';
  selectedPaymentMethod: string = '';
  selectedSeat: any = null;
  isDialog: boolean = false;
  bankInfos: BankInfo[] = [];
  selectedBankIndex: number | null = null;

  paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'fa-university',
      description: 'Make a direct bank transfer'
    }
  ];

  constructor(
    private router: Router,
    private firestore: Firestore,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaymentComponent>,
    private appearanceService: AppearanceService
  ) {
    this.isDialog = !!dialogRef;
    if (data) {
      this.bookingSummary = data.bookingSummary || {};
      this.hotelName = data.hotelName || '';
      this.booking = data.booking || {};
      this.selectedRooms = data.selectedRooms || [];
      this.bookingId = data.bookingId || '';
      this.selectedSeat = data.selectedSeat || null;
    }
  }

  ngOnInit() {
    if (!this.isDialog) {
      // Attempt to get state from navigation
      const navigation = this.router.getCurrentNavigation();
      let state = navigation?.extras.state as {
        bookingSummary?: any;
        hotelName?: string;
        booking?: any;
        selectedRooms?: any[];
        bookingId?: string;
      };

      // If no state from navigation, try to load from localStorage
      if (!state) {
        const savedState = localStorage.getItem('paymentState');
        if (savedState) {
          state = JSON.parse(savedState);
          console.log('Loaded state from localStorage:', state);
        }
      }

      if (state) {
        this.bookingSummary = state.bookingSummary || {};
        this.hotelName = state.hotelName || '';
        this.booking = state.booking || {};
        this.selectedRooms = state.selectedRooms || [];
        this.bookingId = state.bookingId || '';
      }
    }
    this.appearanceService.getAllBankInfo().subscribe((infos) => {
      this.bankInfos = infos;
    });
  }

  selectPaymentMethod(method: any) {
    this.selectedPaymentMethod = method.id;
    console.log('Selected payment method:', method);
  }

  async processPayment() {
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    const paymentMethod = this.paymentMethods.find(method => method.id === this.selectedPaymentMethod)?.name || 'Not specified';

    try {
      if (this.bookingId) {
        const bookingRef = doc(this.firestore, 'bookings', this.bookingId);
        await updateDoc(bookingRef, {
          paymentMethod: paymentMethod,
          selectedSeat: this.selectedSeat || null,
          bookingType: this.bookingSummary.type || 'stay'
        });
      }

      if (this.selectedPaymentMethod === 'card') {
        const cardDialogRef = this.dialog.open(CardSelectionComponent, {
          width: '500px',
          data: { bookingId: this.bookingId }
        });

        cardDialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (this.isDialog) {
              this.dialogRef.close({
                paymentMethod: paymentMethod,
                cardDetails: result
              });
            } else {
              const confirmationState = {
                bookingId: this.bookingId,
                bookingSummary: this.bookingSummary,
                hotelName: this.hotelName,
                booking: this.booking,
                selectedRooms: this.selectedRooms,
                paymentMethod: paymentMethod,
                selectedSeat: this.selectedSeat,
                cardDetails: result,
                status: 'Pending'
              };
              localStorage.setItem('confirmationState', JSON.stringify(confirmationState));
              this.router.navigate(['/confirmation'], {
                state: confirmationState
              });
            }
          }
        });
      } else {
        if (this.isDialog) {
          this.dialogRef.close({
            paymentMethod: paymentMethod
          });
        } else {
          const confirmationState = {
            bookingId: this.bookingId,
            bookingSummary: this.bookingSummary,
            hotelName: this.hotelName,
            booking: this.booking,
            selectedRooms: this.selectedRooms,
            paymentMethod: paymentMethod,
            selectedSeat: this.selectedSeat,
            status: 'Pending'
          };
          localStorage.setItem('confirmationState', JSON.stringify(confirmationState));
          this.router.navigate(['/confirmation'], {
            state: confirmationState
          });
        }
      }

      if (!this.isDialog) {
        localStorage.removeItem('paymentState');
        localStorage.removeItem('bookingState');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  }

  close() {
    if (this.isDialog) {
      this.dialogRef.close();
    }
  }

  selectBank(i: number) {
    this.selectedBankIndex = i;
  }

  proceedWithBank() {
    if (this.selectedBankIndex !== null) {
      const selectedBank = this.bankInfos[this.selectedBankIndex];
      // You can handle the selected bank here, e.g., emit, close dialog, or navigate
      alert('Selected bank: ' + selectedBank.bankName + ' (' + selectedBank.branch + ')');
      // Example: if dialog, close with result
      if (this.isDialog && this.dialogRef) {
        this.dialogRef.close({ bank: selectedBank });
      }
    }
  }
}