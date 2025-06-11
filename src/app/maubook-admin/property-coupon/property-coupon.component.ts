import { Component, OnInit, ViewChild } from '@angular/core';
import { CouponService } from '../../services/coupon.service';
import { Coupon } from '../../model/coupon.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogComComponent } from 'src/app/dialog/dialog-com/dialog-com.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PropertyCouponService } from '../../services/property-coupon.service';

@Component({
  selector: 'app-property-coupon',
  templateUrl: './property-coupon.component.html',
  styleUrls: ['./property-coupon.component.scss'],
})
export class PropertyCouponComponent implements OnInit {
  displayedColumns: string[] = [
    'index',
    'Image',
    'HotelName',
    'couponCode',
    'category',
    'expiryDate',
    'quantity',
    'discount',
    'actions',
  ];

  dataSource = new MatTableDataSource<Coupon>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  allCouponsBackup: Coupon[] = [];
  loading = false;

  pageSize = 10;
  lastDocCodeStack: (string | null)[] = [null];
  currentPage = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  hoveredCoupon: string | null = null;

  constructor(
    private peropertyCouponService: PropertyCouponService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPage(null);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        // Optionally, show a snack bar or success alert
        console.log('Copied to clipboard:', text);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }

  private loadPage(startAfterCode: string | null): void {
    this.loading = true;
    this.peropertyCouponService
      .getCouponsPage(startAfterCode ?? undefined, this.pageSize)
      .subscribe((result) => {
        console.log(result);
        const newCoupons = result.data.map((coupon) => ({
          ...coupon,
          expiryDate: (coupon.expiryDate as any)?.toDate?.() ?? null,
        }));

        this.dataSource.data = newCoupons;
        this.allCouponsBackup = [...newCoupons];
        this.loading = false;
        setTimeout(() => {
          this.dataSource.sort = this.sort;
        });

        this.hasNextPage = newCoupons.length === this.pageSize;
        this.hasPreviousPage = this.currentPage > 0;

        if (startAfterCode === null) {
          this.lastDocCodeStack = [null];
          this.currentPage = 0;
        }
      });
  }

  getNextPage(): void {
    if (!this.hasNextPage) return;
    const lastDocCode =
      this.dataSource.data[this.dataSource.data.length - 1]?.couponCode ?? null;
    this.currentPage++;
    this.lastDocCodeStack.push(lastDocCode);
    this.loadPage(lastDocCode);
  }

  getPreviousPage(): void {
    if (!this.hasPreviousPage) return;
    this.currentPage--;
    this.lastDocCodeStack.pop();
    const prevLastDocCode =
      this.lastDocCodeStack[this.lastDocCodeStack.length - 1] ?? null;
    this.loadPage(prevLastDocCode);
  }

  deleteCoupon(couponId: string) {
    const dialogRef = this.dialog.open(DialogComComponent, {
      width: '350px',
      data: {
        title: 'Delete Coupon',
        message: 'Are you sure you want to delete this coupon?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.peropertyCouponService.deleteCoupon(couponId).then(() => {
          this.dataSource.data = this.dataSource.data.filter(
            (c) => c.id !== couponId
          );
          this.allCouponsBackup = this.allCouponsBackup.filter(
            (c) => c.id !== couponId
          );
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (!filterValue) {
      this.dataSource.data = [...this.allCouponsBackup];
      return;
    }

    this.dataSource.data = this.allCouponsBackup.filter(
      (coupon) =>
        coupon.couponCode.toLowerCase().includes(filterValue) ||
        coupon.category.toLowerCase().includes(filterValue)
    );
  }
}
