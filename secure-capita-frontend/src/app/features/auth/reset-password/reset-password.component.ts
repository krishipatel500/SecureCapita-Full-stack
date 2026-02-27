import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  token: string = '';

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {

    // ✅ ALWAYS CREATE FORM FIRST
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });

    // ✅ THEN GET TOKEN
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.errorMessage.set('Invalid or missing reset token');
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    field === 'password'
      ? this.showPassword.update(v => !v)
      : this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.errorMessage.set('Invalid or expired reset link');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password reset successfully! Redirecting...');

        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Reset failed. Try again.'
        );
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
