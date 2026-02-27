import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.css']
})
export class AddInvoiceComponent implements OnInit {

  invoiceForm!: FormGroup;
  customers: any[] = [];
  isLoadingCustomers = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      status: ['UNPAID'],
      services: this.fb.array([])
    });

    this.addService();
    this.loadCustomers();
  }

  // 🔥 Load customers for dropdown
  loadCustomers() {
    this.isLoadingCustomers = true;

    this.customerService.getCustomers(0, 100, '').subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.customers = data?.content ?? data ?? [];
        this.isLoadingCustomers = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingCustomers = false;
      }
    });
  }

  get services(): FormArray {
    return this.invoiceForm.get('services') as FormArray;
  }

  addService() {
    this.services.push(
      this.fb.group({
        service: ['', Validators.required],
        rate: [0, [Validators.required, Validators.min(0)]],
        quantity: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeService(index: number) {
    this.services.removeAt(index);
  }

  getTotal(): number {
    return this.services.controls.reduce((total, group: any) => {
      const rate = Number(group.value.rate) || 0;
      const qty = Number(group.value.quantity) || 0;
      return total + rate * qty;
    }, 0);
  }

  saveInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.invoiceService.createInvoice(this.invoiceForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/invoices']);
        },
        error: err => console.error(err)
      });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
