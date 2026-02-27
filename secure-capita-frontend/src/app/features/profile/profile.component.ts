import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userEmail: string = '';
  isDropdownOpen = false;
  activeTab: string = 'profile'; // profile, password, account, authentication
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  updateSuccess = false;
  profileImageUrl: string = '';
  imageUploadError: string = '';
  imageUploadSuccess: boolean = false;
  selectedFile: File | null = null;

  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    bio: '',
    joinDate: ''
  };

  recentActivities = [
    {
      device: 'Chrome - Linux Desktop',
      ipAddress: '192.168.1.209',
      date: 'Feb 18, 2025, 2:12 PM',
      type: 'LOGIN_SUCCESS',
      description: 'You logged in successfully',
      action: 'Report'
    },
    {
      device: 'Chrome - Linux Desktop',
      ipAddress: '192.168.1.209',
      date: 'Feb 18, 2025, 2:10 PM',
      type: 'LOGIN_ATTEMPT',
      description: 'You tried to log in',
      action: 'Report'
    },
    {
      device: 'Chrome - Linux Desktop',
      ipAddress: '192.168.1.209',
      date: 'Feb 18, 2025, 2:08 PM',
      type: 'LOGIN_ATTEMPT',
      description: 'You tried to log in',
      action: 'Report'
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || 'admin@mail.com';
    this.fetchProfileDataFromAPI();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9\-\+\(\)\s]*$/)]],
      address: [''],
      jobTitle: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  fetchProfileDataFromAPI(): void {
    console.log('Fetching profile data from API...');
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        console.log('Profile API Response:', response);
        // Handle API response from backend ProfileResponse
        const profileResponse = response.data || response;
        console.log('Extracted Profile Data:', profileResponse);

        this.profileData = {
          firstName: profileResponse.firstName || '',
          lastName: profileResponse.lastName || '',
          email: profileResponse.email || this.userEmail,
          phone: profileResponse.phone || '',
          address: profileResponse.address || '',
          jobTitle: profileResponse.jobTitle || '',
          bio: profileResponse.bio || '',
          joinDate: profileResponse.joinDate || ''
        };

        // Set profile image if available
        if (profileResponse.profileImage) {
          this.profileImageUrl = `http://localhost:8080/uploads/${profileResponse.profileImage}`;
        }

        // Update form with fetched data
        this.profileForm.patchValue({
          firstName: this.profileData.firstName,
          lastName: this.profileData.lastName,
          email: this.profileData.email,
          phone: this.profileData.phone,
          address: this.profileData.address,
          jobTitle: this.profileData.jobTitle,
          bio: this.profileData.bio
        });

        console.log('Profile data loaded successfully:', this.profileData);
      },
      error: (error) => {
        console.error('Error fetching profile data:', error);
        console.error('Error status:', error.status);
        // Fallback to basic data if API fails
        this.profileData.email = this.userEmail;
        this.profileForm.patchValue({
          email: this.userEmail
        });
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.updateSuccess = false;
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updateData = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phone: this.profileForm.get('phone')?.value || '',
      address: this.profileForm.get('address')?.value || '',
      jobTitle: this.profileForm.get('jobTitle')?.value || '',
      bio: this.profileForm.get('bio')?.value || ''
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully:', response);
        this.updateSuccess = true;
        this.profileData = {
          ...this.profileData,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          address: updateData.address,
          jobTitle: updateData.jobTitle,
          bio: updateData.bio
        };
        setTimeout(() => {
          this.updateSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.imageUploadError = 'Please select an image file';
      setTimeout(() => {
        this.imageUploadError = '';
      }, 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageUploadError = 'Image size should be less than 5MB';
      setTimeout(() => {
        this.imageUploadError = '';
      }, 3000);
      return;
    }

    this.selectedFile = file;
    this.imageUploadError = '';

    // Preview image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload image
    this.authService.uploadProfileImage(file).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully:', response);
        this.imageUploadSuccess = true;
        setTimeout(() => {
          this.imageUploadSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.imageUploadError = 'Failed to upload image. Please try again.';
        setTimeout(() => {
          this.imageUploadError = '';
        }, 3000);
      }
    });
  }

  removeImage(): void {
    this.profileImageUrl = '';
    this.selectedFile = null;
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.get('newPassword')?.value !== this.passwordForm.get('confirmPassword')?.value) {
      alert('Passwords do not match!');
      return;
    }

    // Simulate API call
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
      this.passwordForm.reset();
    }, 3000);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.nav-right')) {
      this.isDropdownOpen = false;
    }
  }

  getActivityType(type: string): string {
    const types: any = {
      'LOGIN_SUCCESS': 'Success',
      'LOGIN_ATTEMPT': 'Attempt'
    };
    return types[type] || type;
  }

  getActivityColor(type: string): string {
    return type === 'LOGIN_SUCCESS' ? 'success' : 'warning';
  }
}
