import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  userEmail = '';
  isDropdownOpen = false;

  invoices: any[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  searchTerm = '';
  private search$ = new Subject<string>();

  constructor(
    private router: Router,
    private invoiceService: InvoiceService,
     private cdr: ChangeDetectorRef  // ✅ ADD THIS
  ) {
    this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadInvoices();
    });
  }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || 'admin@mail.com';
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        const data = response?.data ?? response;

        if (data?.content) {
          this.invoices = data.content;
          this.totalElements = data.totalElements ?? 0;
          this.totalPages = data.totalPages ?? 0;
        } else if (Array.isArray(data)) {
          this.invoices = data;
          this.totalElements = data.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        } else if (Array.isArray(data?.invoices)) {
          this.invoices = data.invoices;
          this.totalElements = data.total ?? data.invoices.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        } else {
          this.invoices = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }

        this.isLoading = false;
        this.cdr.detectChanges();   // ✅ ADD THIS LINE
      },
      error: (err) => {
        console.error('Error loading invoices:', err);
        this.errorMessage = 'Failed to load invoices. Please try again.';
        this.invoices = [];
        this.isLoading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.search$.next(value);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadInvoices();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewInvoice(invoice: any): void {
    const id = invoice?.id ?? invoice?.invoiceNumber;
    if (!id) return;
    this.router.navigate(['/invoices', id]);
  }

goToAddInvoice() {
  this.router.navigate(['/invoices/new']);
}

printInvoice(invoice: any): void {
  const id = invoice?.id ?? invoice?.invoiceNumber;
  if (!id) return;

  this.router.navigate(['/invoices', id], {
    queryParams: { print: true }
  });
}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.isDropdownOpen = false;
  }

  goToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') return 'paid';
    if (s === 'OVERDUE') return 'overdue';
    return 'pending';
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.nav-right')) {
      this.isDropdownOpen = false;
    }
  }
}

