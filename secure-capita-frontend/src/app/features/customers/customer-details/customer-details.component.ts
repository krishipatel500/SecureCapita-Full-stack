import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent implements OnInit {

  customerForm!: FormGroup;
  invoices: any[] = [];
  isLoading = true;
  isSubmitting = false;
  customerId!: number;

  stats = {
    totalInvoices: 0,
    totalBilled: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef   // ✅ ADD THIS

  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomer();
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: [''],
      type: ['PERSON', Validators.required],
      status: ['ACTIVE', Validators.required],
      imageUrl: ['']
    });
  }

  // STRICT MODE SAFE ACCESSOR
  get f() {
    return this.customerForm.controls;
  }

  loadCustomer(): void {
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.customerForm.patchValue(res.data);
        }
        this.loadInvoices();
        this.isLoading = false;
          this.cdr.detectChanges();   // ✅ ADD THIS LINE
      },
      error: () => (this.isLoading = false)
    });
  }

  loadInvoices(): void {
    this.invoiceService
      .getInvoicesByCustomer(this.customerId, 0, 50)
      .subscribe((res: any) => {
        this.invoices = res?.data?.content ?? [];
        this.calculateStats();
      });
  }

  calculateStats(): void {
    this.stats.totalInvoices = this.invoices.length;
    this.stats.totalBilled = this.invoices.reduce(
      (sum, inv) => sum + Number(inv.total ?? inv.amount ?? 0),
      0
    );
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.customerService
      .updateCustomer(this.customerId, this.customerForm.value)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loadCustomer();
        },
        error: () => (this.isSubmitting = false)
      });
  }

  viewInvoice(invoice: any): void {
    this.router.navigate(['/invoices', invoice.id]);
  }
}
