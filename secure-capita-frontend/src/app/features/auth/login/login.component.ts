import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { finalize } from 'rxjs'; // ✅ FIXED

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  serverError = '';
  isLoading = false;
  private messageTimeout: any;

  private storage = inject(AuthStorageService);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    const token = this.storage.getToken();
    if (token) {
      this.router.navigate(['/dashboard']);
    }

    this.initializeForm();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50)
        ]
      ]
    });
  }

  private showError(message: string) {
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.serverError = message;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.messageTimeout = setTimeout(() => {
      this.serverError = '';
    }, 8000);
  }

  markFieldTouched(fieldName: string) {
    this.loginForm.get(fieldName)?.markAsTouched();
  }

  onSubmit() {
    this.serverError = '';
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    // ✅ FIXED
    this.auth.login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (!res?.token) {
            this.showError('Invalid server response');
            return;
          }

          this.storage.setToken(res.token);
          this.storage.setUserEmail(res.email ?? '');

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.showError(err?.error?.message || 'Login failed');
        }
      });
  }
}
