import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private baseUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  // 🔥 ==============================
  // DASHBOARD REFRESH TRIGGER
  // ==============================

  private refreshDashboardSubject = new BehaviorSubject<void>(undefined);
  refreshDashboard$ = this.refreshDashboardSubject.asObservable();

  triggerDashboardRefresh() {
    this.refreshDashboardSubject.next();
  }

  // =================================
  // API METHODS
  // =================================

  getInvoices(page: number = 0, size: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);

    return this.http.get<any>(this.baseUrl, { params });
  }

  getInvoiceById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createInvoice(invoice: any) {
  return this.http.post<any>(`${this.baseUrl}`, invoice);
}

  getInvoicesByCustomer(customerId: number, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(
      `http://localhost:8080/api/customers/${customerId}/invoices`,
      { params }
    );
  }
}
