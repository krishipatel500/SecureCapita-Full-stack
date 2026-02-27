package com.example.SecureCapita.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ProfileResponse {

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String jobTitle;
    private String bio;
    private String profileImage;
}
