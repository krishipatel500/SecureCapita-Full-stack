package com.example.SecureCapita.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvoiceItemResponse {
    private Long id;
    private String service;
    private BigDecimal rate;
    private Integer quantity;
    private BigDecimal lineTotal;
}

