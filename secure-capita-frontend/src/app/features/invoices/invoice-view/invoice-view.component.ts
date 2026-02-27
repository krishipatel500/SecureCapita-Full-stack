import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.css']
})
export class InvoiceViewComponent implements OnInit {

  invoiceId!: number;
  invoice: any;

  isLoading = true;
  errorMessage = '';

  // 🔥 CALCULATED VALUES
  items: any[] = [];
  subTotal = 0;
  taxRate = 0.05; // 5%
  taxAmount = 0;
  grandTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
     private cdr: ChangeDetectorRef  // ✅ ADD THIS
  ) {}

  ngOnInit(): void {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInvoice();

    this.route.queryParams.subscribe(params => {
      if (params['print'] === 'true') {
        setTimeout(() => window.print(), 800);
      }
    });
  }

  loadInvoice(): void {
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (res: any) => {
        this.invoice = res?.data ?? res;

        // Normalize items
        this.items =
          this.invoice?.items ||
          this.invoice?.services ||
          [
            {
              name: this.invoice?.service || 'Service',
              price: this.invoice?.total || 0,
              quantity: 1
            }
          ];

        this.calculateTotals();
        this.isLoading = false;
         this.cdr.detectChanges();   // ✅ ADD THIS LINE
      },
      error: () => {
        this.errorMessage = 'Failed to load invoice';
        this.isLoading = false;
      }
    });
  }

  calculateTotals(): void {
    this.subTotal = this.items.reduce((sum, item) => {
      const price = Number(item.price ?? item.rate ?? item.total ?? 0);
      const qty = Number(item.quantity ?? 1);
      return sum + price * qty;
    }, 0);

    this.taxAmount = this.subTotal * this.taxRate;
    this.grandTotal = this.subTotal + this.taxAmount;
  }

  goToInvoices() {
    this.router.navigate(['/invoices']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  exportPdf() {
    window.print();
  }

@HostListener('document:click')
clickOutside() {}
}
