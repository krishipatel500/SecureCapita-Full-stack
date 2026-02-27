import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import { LoginRequest, AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ===============================
  // 🔐 AUTH APIs
  // ===============================

  register(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/register`,
      data
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', response.email);
      })
    );
  }

  forgotPassword(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/forgot-password`,
      data
    );
  }

  resetPassword(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/reset-password`,
      data
    );
  }

  validateResetToken(token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/reset-password?token=${token}`
    );
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/check-email?email=${encodeURIComponent(email)}`
    );
  }

  verifyAccount(token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/verify?token=${token}`
    );
  }

  // ===============================
  // 👤 PROFILE APIs
  // ===============================

  getUserProfile(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/profile`
    );
  }

  updateProfile(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/profile`,
      data
    );
  }

  uploadProfileImage(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/profile/image`,
      formData
    );
  }
}
