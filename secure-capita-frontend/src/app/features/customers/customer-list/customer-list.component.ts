import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  userEmail: string = '';
  isDropdownOpen = false;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Search
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  // Loading
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
  private router: Router,
  private customerService: CustomerService,
  private cdr: ChangeDetectorRef  // ✅ ADD THIS
){
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadCustomers();
    });
  }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || 'admin@mail.com';
    this.loadCustomers();
  }

  loadCustomers(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.customerService
    .getCustomers(this.currentPage, this.pageSize, this.searchTerm)
    .subscribe({
      next: (response) => {

        if (response.success) {
          const pageData = response.data;

          this.customers = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
        } else {
          this.errorMessage = response.message;
        }

        this.isLoading = false;

        this.cdr.detectChanges();   // ✅ ADD THIS LINE
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = error;
        this.customers = [];
        this.isLoading = false;

        this.cdr.detectChanges();   // ✅ ALSO HERE
      }
    });
}

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get Math() {
    return Math;
  }

  viewCustomer(id: number): void {
    this.router.navigate(['/customers', id]);
  }

  exportToExcel(): void {

  this.customerService.exportToExcel().subscribe({
    next: (data: Blob) => {

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'customers.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => alert('Excel export failed')
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.nav-right')) {
      this.isDropdownOpen = false;
    }
  }
}
