import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {

  private readonly TOKEN_KEY = 'token';
  private readonly EMAIL_KEY = 'userEmail';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  setUserEmail(email: string): void {
    localStorage.setItem(this.EMAIL_KEY, email);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
  }
}