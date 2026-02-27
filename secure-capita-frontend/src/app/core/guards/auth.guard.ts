import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

export const authGuard: CanActivateChildFn = (route, state) => {

  const router = inject(Router);
  const authStorage = inject(AuthStorageService);

  const token = authStorage.getToken();

  if (!token) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
