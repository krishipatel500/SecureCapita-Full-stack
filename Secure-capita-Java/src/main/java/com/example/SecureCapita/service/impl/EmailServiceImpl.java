package com.example.SecureCapita.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.example.SecureCapita.service.EmailService;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String to, String token) {

//        String link = "http://localhost:8080/api/auth/verify?token=" + token;
        String link = "http://localhost:4200/verify?token=" + token;


        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify Your Account");
        message.setText("Click the link to verify your account:\n" + link);

        mailSender.send(message);
    }

    @Override
    public void sendResetPasswordEmail(String to, String token) {

        String link = "http://localhost:4200/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset Password");
        message.setText("Click the link to reset your password:\n" + link);

        mailSender.send(message);
    }

}
