
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BookingService } from 'src/app/services/booking.service';

interface Treatment {
  id: string;
  name: string;
  duration: string;
  price: number;
}

@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss']
})
export class PackageDetailsComponent implements OnInit {
  package: any;
  selectedDate: Date | null = null;
  selectedTicket: any = null;
  currentImageIndex: number = 0;
  loading: boolean = true;
  quantities: { [key: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadPackage(params['id']);
    });
  }

  loadPackage(id: string) {
    this.loading = true;
    this.firestore.doc(`packages/${id}`).get().subscribe(doc => {
      if (doc.exists) {
        const data = doc.data() as any;
        this.package = {
          id: doc.id,
          ...data,
          tickets: data.tickets || [],
          features: data.features || [],
          images: data.images || []
        };
        this.quantities = {};
        this.package.tickets.forEach((ticket: { name: string | number; }) => {
          this.quantities[ticket.name] = 0;
        });
      }
      this.loading = false;
    });
  }

  onDateSelect(event: any) {
    const dateValue = event.target.value;
    if (dateValue) {
      this.selectedDate = new Date(dateValue);
    } else {
      this.selectedDate = null;
    }
    this.selectedTicket = null;
    this.resetQuantities();
  }

  resetQuantities() {
    Object.keys(this.quantities).forEach(key => {
      this.quantities[key] = 0;
    });
  }

  selectTicket(ticket: any) {
    if (this.selectedTicket && this.selectedTicket.name !== ticket.name) {
      this.quantities[this.selectedTicket.name] = 0;
    }

    this.selectedTicket = ticket;
    if (!this.quantities[ticket.name]) {
      this.quantities[ticket.name] = 0;
    }

    const bookingElement = document.querySelector('.booking-sidebar');
    bookingElement?.scrollIntoView({ behavior: 'smooth' });
  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.package.images.length) % this.package.images.length;
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.package.images.length;
  }

  incrementQuantity(ticketName: string): void {
    if (!this.quantities[ticketName]) {
      this.quantities[ticketName] = 0;
    }
    this.quantities[ticketName]++;
  }

  decrementQuantity(ticketName: string): void {
    if (this.quantities[ticketName] && this.quantities[ticketName] > 0) {
      this.quantities[ticketName]--;
    }
  }

  calculateTotalQuantity(): number {
    return Object.values(this.quantities).reduce((sum, qty) => sum + qty, 0);
  }

  calculatePerTicketPrice(): number {
    if (!this.selectedTicket) return 0;
    return this.selectedTicket.price;
  }

  calculateTotalPrice(): number {
    let total = 0;
    this.package.tickets.forEach((ticket: { price: number; name: string | number; }) => {
      total += ticket.price * this.quantities[ticket.name];
    });
    return total;
  }

  bookNow(): void {
    if (!this.selectedDate || !(this.selectedDate instanceof Date) || isNaN(this.selectedDate.getTime())) {
      alert('Please select a valid date before proceeding.');
      return;
    }
  
    if (!this.selectedTicket || this.calculateTotalQuantity() === 0) {
      alert('Please select a ticket and quantity before proceeding.');
      return;
    }

    const bookingState = {
      fromPackagePage: true,
      packageId: this.package.id,
      packageName: this.package.name,
      amount: this.calculateTotalPrice(),
      date: this.selectedDate.toISOString(),
      ticketName: this.selectedTicket.name,
      ticketPrice: this.selectedTicket.price,
      quantity: this.quantities[this.selectedTicket.name]
    };

    // Store in localStorage as a fallback
    localStorage.setItem('bookingState', JSON.stringify(bookingState));
    
    console.log('Navigating with state:', bookingState);

    this.router.navigate(['/booking-category'], {
      state: bookingState
    });
  }
}