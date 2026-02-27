package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.CustomerStatus;
import com.example.SecureCapita.entity.CustomerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCustomerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String address;
    private String phone;

    private CustomerType type;       // PERSON / COMPANY
    private CustomerStatus status;// ACTIVE / INACTIVE
    private String imageUrl;
}
