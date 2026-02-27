package com.example.SecureCapita.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")   // IMPORTANT (avoid reserved word "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // THIS IS REQUIRED

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    private boolean enabled;

    private String phone;
    private String address;
    private String jobTitle;

    @Column(length = 1000)
    private String bio;

    private String profileImage;
}
