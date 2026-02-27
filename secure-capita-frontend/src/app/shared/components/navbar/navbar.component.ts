import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  userEmail: string = localStorage.getItem('userEmail') || '';

  isProfileOpen = false;
  isCustomersOpen = false;
  isInvoicesOpen = false;

  constructor(private router: Router) {}

  toggleMenu(menu: string): void {
    this.isCustomersOpen = menu === 'customers' ? !this.isCustomersOpen : false;
    this.isInvoicesOpen = menu === 'invoices' ? !this.isInvoicesOpen : false;
    this.isProfileOpen = menu === 'profile' ? !this.isProfileOpen : false;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.closeAll();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  closeAll(): void {
    this.isCustomersOpen = false;
    this.isInvoicesOpen = false;
    this.isProfileOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.dropdown-wrapper')) {
      this.closeAll();
    }
  }
}
