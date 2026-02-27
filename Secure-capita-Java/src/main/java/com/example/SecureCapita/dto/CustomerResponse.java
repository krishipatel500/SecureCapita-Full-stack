package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.CustomerStatus;
import com.example.SecureCapita.entity.CustomerType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String address;
    private String phone;
    private CustomerType type;
    private CustomerStatus status;
    private String imageUrl;
    private LocalDateTime createdAt;
}

