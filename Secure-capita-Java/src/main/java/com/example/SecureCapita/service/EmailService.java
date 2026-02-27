package com.example.SecureCapita.service;

public interface EmailService {
    void sendVerificationEmail(String to, String token);
    void sendResetPasswordEmail(String to, String token);
}
