package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "Customer id is required")
    private Long customerId;

    private LocalDate invoiceDate;
    private InvoiceStatus status;

    @Valid
    private List<InvoiceItemRequest> services;
}

