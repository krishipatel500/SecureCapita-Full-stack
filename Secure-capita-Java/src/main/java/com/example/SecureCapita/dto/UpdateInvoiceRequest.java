package com.example.SecureCapita.dto;

import com.example.SecureCapita.entity.InvoiceStatus;
import jakarta.validation.Valid;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateInvoiceRequest {
    private LocalDate invoiceDate;
    private InvoiceStatus status;

    @Valid
    private List<InvoiceItemRequest> services;
}

