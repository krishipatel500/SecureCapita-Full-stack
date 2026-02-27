import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailComponent implements OnInit {

  token!: string;
  isLoading = signal(true);
  isVerified = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Get token from URL query parameters
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid or missing verification token');
      return;
    }

    // Auto-verify account on page load
    this.verifyEmail();
  }

  verifyEmail(): void {
    this.auth.verifyAccount(this.token).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isVerified.set(true);
        this.successMessage.set('✅ Account verified successfully! Redirecting to login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
         this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to verify email. Please try registering again.');
      }
    });
  }

  retryVerification(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.verifyEmail();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
