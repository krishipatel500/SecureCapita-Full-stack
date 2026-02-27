package com.example.SecureCapita.service;

import com.example.SecureCapita.dto.CreateInvoiceRequest;
import com.example.SecureCapita.dto.InvoiceResponse;
import com.example.SecureCapita.dto.UpdateInvoiceRequest;
import com.example.SecureCapita.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.SecureCapita.dto.CustomerInvoiceSummaryResponse;

public interface InvoiceService {

    Page<InvoiceResponse> listInvoices(User user, Long customerId, Pageable pageable);

    InvoiceResponse getInvoice(User user, Long invoiceId);

    InvoiceResponse getInvoiceByNumber(User user, String invoiceNumber);

    CustomerInvoiceSummaryResponse getCustomerInvoiceSummary(User user, Long customerId);

    InvoiceResponse createInvoice(User user, CreateInvoiceRequest request);

    InvoiceResponse updateInvoice(User user, Long invoiceId, UpdateInvoiceRequest request);

    void deleteInvoice(User user, Long invoiceId);
}

