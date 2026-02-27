package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BigDecimal total;
    private LocalDate invoiceDate;
    private InvoiceStatus status;
    private List<InvoiceItemResponse> services;
    private LocalDateTime createdAt;
}

