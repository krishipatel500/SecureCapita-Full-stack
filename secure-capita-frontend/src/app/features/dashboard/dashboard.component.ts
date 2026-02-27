import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ FIXED
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  userEmail: string = '';

  stats = {
    totalCustomers: 0,
    totalInvoices: 0,
    totalBilled: 0
  };

  customers: any[] = [];
  allCustomers: any[] = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  isLoading = false;

  private destroy$ = new Subject<void>();

constructor(
  private router: Router,
  private customerService: CustomerService,
  private invoiceService: InvoiceService,
  private cdr: ChangeDetectorRef   // ✅ ADD THIS
) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {

    this.isLoading = true;

    forkJoin({
      customers: this.customerService.getCustomers(0, 1000, ''),
      invoices: this.invoiceService.getInvoices(0, 1000, '')
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: ({ customers, invoices }) => {

  const customerList = customers?.data?.content ?? [];
  const invoiceList = invoices?.data?.content ?? [];

  this.stats.totalCustomers = customerList.length;
  this.stats.totalInvoices = invoiceList.length;

  this.stats.totalBilled = invoiceList.reduce(
    (sum: number, inv: any) =>
      sum + (inv.total ?? inv.amount ?? 0),
    0
  );

  this.allCustomers = customerList;
  this.totalElements = customerList.length;
  this.totalPages = Math.ceil(this.totalElements / this.pageSize);

  this.updatePagedCustomers();

  this.isLoading = false;

  this.cdr.detectChanges();   // ✅ THIS LINE FIXES YOUR ISSUE
},

      error: () => {
        this.isLoading = false;
      }
    });
  }

  updatePagedCustomers(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.customers = this.allCustomers.slice(start, end);
  }

  viewCustomer(id: number): void {
    this.router.navigate(['/customers', id]);
  }
}
