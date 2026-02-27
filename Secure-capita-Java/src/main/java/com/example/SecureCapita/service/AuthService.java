package com.example.SecureCapita.service;

import com.example.SecureCapita.dto.ForgotPasswordRequest;
import com.example.SecureCapita.dto.LoginRequest;
import com.example.SecureCapita.dto.RegisterRequest;
import com.example.SecureCapita.dto.ResetPasswordRequest;
import com.example.SecureCapita.response.ApiResponse;
import com.example.SecureCapita.dto.LoginResponse;
import com.example.SecureCapita.dto.ProfileResponse;
import com.example.SecureCapita.dto.UpdateProfileRequest;
import org.springframework.web.multipart.MultipartFile;


public interface AuthService {


        ApiResponse register(RegisterRequest request);

        ApiResponse verifyAccount(String token);

        LoginResponse login(LoginRequest request);

        ProfileResponse getProfile(String email);

        ApiResponse updateProfile(String email, UpdateProfileRequest request);

        ApiResponse uploadProfileImage(String email, MultipartFile file);  // 👈 MUST EXIST

        ApiResponse forgotPassword(ForgotPasswordRequest request);

        ApiResponse resetPassword(ResetPasswordRequest request);

        ApiResponse validateResetToken(String token);
    }
