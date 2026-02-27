package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.CustomerStatus;
import com.example.SecureCapita.entity.CustomerType;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateCustomerRequest {
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private String address;
    private String phone;

    private CustomerType type;
    private CustomerStatus status;
    private String imageUrl;   // ✅ ADD THIS LINE
}

