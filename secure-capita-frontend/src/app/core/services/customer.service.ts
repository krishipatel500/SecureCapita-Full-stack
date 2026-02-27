import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly baseUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  // ===============================
  // 🔥 DASHBOARD LIVE REFRESH
  // ===============================

  private refreshDashboardSubject = new BehaviorSubject<boolean>(false);
  refreshDashboard$ = this.refreshDashboardSubject.asObservable();

  triggerDashboardRefresh(): void {
    this.refreshDashboardSubject.next(true);
  }

  // ===============================
  // 📦 CUSTOMER APIs
  // ===============================

  getCustomers(
    page: number,
    size: number,
    search?: string
  ): Observable<ApiResponse<any>> {

    let url = `${this.baseUrl}?page=${page}&size=${size}`;

    if (search?.trim()) {
      url += `&search=${search}`;
    }

    return this.http.get<ApiResponse<any>>(url);
  }

  getCustomerById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  createCustomer(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, data);
  }

  updateCustomer(id: number, customer: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/${id}`,
      customer
    );
  }

  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/${id}`
    );
  }




  exportToExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/export`,
      {
        responseType: 'blob'
      }
    );
  }
}
