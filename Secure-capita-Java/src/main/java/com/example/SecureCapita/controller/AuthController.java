package com.example.SecureCapita.controller;

import com.example.SecureCapita.dto.*;
import com.example.SecureCapita.response.ApiResponse;
import com.example.SecureCapita.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(authService.register(request));
    }

    // ================= EMAIL VERIFY =================
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verify(
            @RequestParam String token) {

        return ResponseEntity.ok(authService.verifyAccount(token));
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    // ================= PROFILE =================
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized access", null));
        }

        String email = authentication.getName();

        ProfileResponse profile = authService.getProfile(email);

        return ResponseEntity.ok(
                new ApiResponse(true, "Profile fetched successfully", profile)
        );
    }


    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                authService.updateProfile(email, request)
        );
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                authService.uploadProfileImage(email, file)
        );
    }




    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgot(
            @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> reset(
            @RequestBody ResetPasswordRequest request) {

        return ResponseEntity.ok(authService.resetPassword(request));
    }

    // ================= VALIDATE RESET TOKEN =================
    @GetMapping("/reset-password")
    public ResponseEntity<ApiResponse> validateToken(
            @RequestParam String token) {

        return ResponseEntity.ok(authService.validateResetToken(token));
    }
}
