package com.example.SecureCapita.service.impl;

import com.example.SecureCapita.dto.*;
import com.example.SecureCapita.entity.*;
import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.repository.*;
import com.example.SecureCapita.response.ApiResponse;
import com.example.SecureCapita.service.AuthService;
import com.example.SecureCapita.service.EmailService;
import com.example.SecureCapita.config.JwtService;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;


    @Override
    public ApiResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException(
                    "Email already in use. Please use a different email.",
                    HttpStatus.CONFLICT
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .build();

        userRepository.save(user);

        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), token);

        return new ApiResponse("Registration successful. Please verify your email.");
    }


    @Override
    public ApiResponse verifyAccount(String token) {

        VerificationToken verificationToken = verificationTokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new CustomException(
                                "Invalid verification token",
                                HttpStatus.BAD_REQUEST
                        )
                );

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new CustomException(
                    "Token expired",
                    HttpStatus.BAD_REQUEST
            );
        }


        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        return new ApiResponse("Account verified successfully. You can now login.");
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new CustomException(
                                "Invalid email or password",
                                HttpStatus.UNAUTHORIZED
                        )
                );

        if (!user.isEnabled()) {
            throw new CustomException(
                    "Please verify your email first.",
                    HttpStatus.FORBIDDEN
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(
                    "Invalid email or password",
                    HttpStatus.UNAUTHORIZED
            );
        }

        String jwtToken = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                jwtToken,
                user.getEmail(),
                "Login successful"
        );
    }

    @Override
    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new CustomException("User not found", HttpStatus.NOT_FOUND)
                );

        return ProfileResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .jobTitle(user.getJobTitle())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .build();
    }

    @Override
    public ApiResponse uploadProfileImage(String email, MultipartFile file) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new CustomException("User not found", HttpStatus.NOT_FOUND)
                );

        try {
            String uploadDir = "uploads/";
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            user.setProfileImage(fileName);
            userRepository.save(user);

            return new ApiResponse("Profile image uploaded successfully");

        } catch (Exception e) {
            throw new CustomException("Could not upload image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @Override
    public ApiResponse updateProfile(String email, UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new CustomException("User not found", HttpStatus.NOT_FOUND)
                );

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setJobTitle(request.getJobTitle());
        user.setBio(request.getBio());

        userRepository.save(user);

        return new ApiResponse("Profile updated successfully");
    }


    @Override
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new CustomException(
                                "Email not found",
                                HttpStatus.NOT_FOUND
                        )
                );


        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();

        passwordResetTokenRepository.save(resetToken);

        emailService.sendResetPasswordEmail(user.getEmail(), token);

        return new ApiResponse("Reset password link sent to your email.");
    }

    @Override
    public ApiResponse resetPassword(ResetPasswordRequest request) {

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() ->
                        new CustomException(
                                "Invalid reset token",
                                HttpStatus.BAD_REQUEST
                        )
                );

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new CustomException(
                    "Reset token expired",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(
                    "Passwords do not match",
                    HttpStatus.BAD_REQUEST
            );
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        return new ApiResponse("Password reset successfully");
    }



    @Override
    public ApiResponse validateResetToken(String token) {

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new CustomException(
                                "Invalid reset token",
                                HttpStatus.BAD_REQUEST
                        )
                );

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new CustomException(
                    "Reset token expired",
                    HttpStatus.BAD_REQUEST
            );
        }



        return new ApiResponse("Token is valid. You can reset your password.");
    }




}
