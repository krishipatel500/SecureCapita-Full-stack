import { Routes } from '@angular/router';
import { LayoutComponent } from './features/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [

  // ================= PUBLIC ROUTES (NO NAVBAR) =================
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ================= PRIVATE ROUTES (WITH LAYOUT + NAVBAR) =================
  {
    path: '',
    component: LayoutComponent,
    children: [

      // Dashboard
      { path: 'dashboard', component: DashboardComponent },

      // ================= CUSTOMERS =================
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/customers/customer-list/customer-list.component')
                .then(m => m.CustomerListComponent)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/customers/add-customer/add-customer.component')
                .then(m => m.AddCustomerComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/customer-details/customer-details.component')
                .then(m => m.CustomerDetailsComponent)
          }
        ]
      },

      // ================= INVOICES =================
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/invoices/invoice-list/invoice-list.component')
                .then(m => m.InvoiceListComponent)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/invoices/add-invoice/add-invoice.component')
                .then(m => m.AddInvoiceComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/invoices/invoice-view/invoice-view.component')
                .then(m => m.InvoiceViewComponent)
          }
        ]
      },

      // ================= PROFILE =================
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent)
      },

      // Default redirect inside layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

    ]
  },

  // ================= FALLBACK =================
  { path: '**', redirectTo: 'login' }

];
