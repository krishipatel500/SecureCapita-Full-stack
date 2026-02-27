package com.example.SecureCapita.service.impl;

import com.example.SecureCapita.dto.*;
import com.example.SecureCapita.entity.Customer;
import com.example.SecureCapita.entity.Invoice;
import com.example.SecureCapita.entity.InvoiceItem;
import com.example.SecureCapita.entity.User;
import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.repository.CustomerRepository;
import com.example.SecureCapita.repository.InvoiceRepository;
import com.example.SecureCapita.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Override
    public Page<InvoiceResponse> listInvoices(User user, Long customerId, Pageable pageable) {
        Page<Invoice> page = (customerId == null)
                ? invoiceRepository.findByCustomer_User(user, pageable)
                : invoiceRepository.findByCustomer_IdAndCustomer_User(customerId, user, pageable);
        return page.map(this::toResponse);
    }

    @Override
    public InvoiceResponse getInvoice(User user, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCustomer_User(invoiceId, user)
                .orElseThrow(() -> new CustomException("Invoice not found", HttpStatus.NOT_FOUND));
        return toResponse(invoice);
    }

    @Override
    public InvoiceResponse getInvoiceByNumber(User user, String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumberAndCustomer_User(invoiceNumber, user)
                .orElseThrow(() -> new CustomException("Invoice not found", HttpStatus.NOT_FOUND));
        return toResponse(invoice);
    }

    @Override
    public InvoiceResponse createInvoice(User user, CreateInvoiceRequest request) {
        Customer customer = customerRepository.findByIdAndUser(request.getCustomerId(), user)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .customer(customer)
                .invoiceDate(request.getInvoiceDate())
                .status(request.getStatus())
                .build();

        applyServicesAndRecalculate(invoice, request.getServices());

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Override
    public InvoiceResponse updateInvoice(User user, Long invoiceId, UpdateInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndCustomer_User(invoiceId, user)
                .orElseThrow(() -> new CustomException("Invoice not found", HttpStatus.NOT_FOUND));

        if (request.getInvoiceDate() != null) invoice.setInvoiceDate(request.getInvoiceDate());
        if (request.getStatus() != null) invoice.setStatus(request.getStatus());

        if (request.getServices() != null) {
            applyServicesAndRecalculate(invoice, request.getServices());
        } else {
            invoice.setTotal(recalculateTotal(invoice.getServices()));
        }

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Override
    public void deleteInvoice(User user, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCustomer_User(invoiceId, user)
                .orElseThrow(() -> new CustomException("Invoice not found", HttpStatus.NOT_FOUND));
        invoiceRepository.delete(invoice);
    }

    private void applyServicesAndRecalculate(Invoice invoice, List<InvoiceItemRequest> services) {
        invoice.getServices().clear();

        List<InvoiceItem> items = new ArrayList<>();
        if (services != null) {
            for (InvoiceItemRequest req : services) {
                BigDecimal rate = req.getRate() == null ? BigDecimal.ZERO : req.getRate();
                int qty = req.getQuantity() == null ? 0 : req.getQuantity();
                BigDecimal lineTotal = rate.multiply(BigDecimal.valueOf(qty));

                InvoiceItem item = InvoiceItem.builder()
                        .invoice(invoice)
                        .service(req.getService())
                        .rate(rate)
                        .quantity(qty)
                        .lineTotal(lineTotal)
                        .build();
                items.add(item);
            }
        }

        invoice.getServices().addAll(items);
        invoice.setTotal(recalculateTotal(invoice.getServices()));
    }

    private BigDecimal recalculateTotal(List<InvoiceItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        if (items == null) return total;
        for (InvoiceItem item : items) {
            if (item.getLineTotal() != null) total = total.add(item.getLineTotal());
        }
        return total;
    }

    private InvoiceResponse toResponse(Invoice inv) {
        List<InvoiceItemResponse> items = inv.getServices() == null
                ? List.of()
                : inv.getServices().stream().map(i ->
                InvoiceItemResponse.builder()
                        .id(i.getId())
                        .service(i.getService())
                        .rate(i.getRate())
                        .quantity(i.getQuantity())
                        .lineTotal(i.getLineTotal())
                        .build()
        ).toList();

        return InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .customerId(inv.getCustomer().getId())
                .customerName(inv.getCustomer().getName())
                .customerEmail(inv.getCustomer().getEmail())
                .customerPhone(inv.getCustomer().getPhone())
                .total(inv.getTotal())
                .invoiceDate(inv.getInvoiceDate())
                .status(inv.getStatus())
                .services(items)
                .createdAt(inv.getCreatedAt())
                .build();
    }

    private String generateInvoiceNumber() {
        // similar to "VARLBI4" from your screenshot
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();

        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 7; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
            String candidate = sb.toString();
            if (!invoiceRepository.existsByInvoiceNumber(candidate)) return candidate;
        }

        throw new CustomException("Could not generate invoice number", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

