import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit {
  customerForm!: FormGroup;
  userEmail: string = '';
  isDropdownOpen = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || 'admin@mail.com';
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\(\)\s]*$/)]],
      address: [''],
     type: ['PERSON', Validators.required],
      status: ['ACTIVE', Validators.required],
      imageUrl: ['']
    });
  }

 onSubmit(): void {
  if (this.customerForm.invalid) {
    this.customerForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = '';
  this.successMessage = '';

  this.customerService.createCustomer(this.customerForm.value)
    .subscribe({
      next: (response: any) => {

        if (response.success) {
          this.successMessage = response.message;

          // 🔥 IMPORTANT LINE
          this.customerService.triggerDashboardRefresh();

          setTimeout(() => {
            this.router.navigate(['/customers']);
          }, 1500);

        } else {
          this.errorMessage = response.message;
        }

        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.isSubmitting = false;
      }
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
