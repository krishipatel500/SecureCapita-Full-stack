package com.example.SecureCapita.controller;

import com.example.SecureCapita.dto.CreateInvoiceRequest;
import com.example.SecureCapita.dto.InvoiceResponse;
import com.example.SecureCapita.dto.UpdateInvoiceRequest;
import com.example.SecureCapita.entity.User;
import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.repository.UserRepository;
import com.example.SecureCapita.response.ApiResponse;
import com.example.SecureCapita.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long customerId,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<InvoiceResponse> data = invoiceService.listInvoices(user, customerId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoices fetched successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> get(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        InvoiceResponse data = invoiceService.getInvoice(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice fetched successfully", data));
    }



    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getByNumber(
            @PathVariable String invoiceNumber,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        InvoiceResponse data = invoiceService.getInvoiceByNumber(user, invoiceNumber);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice fetched successfully", data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(
            @Valid @RequestBody CreateInvoiceRequest request,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        InvoiceResponse data = invoiceService.createInvoice(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Invoice created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvoiceRequest request,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        InvoiceResponse data = invoiceService.updateInvoice(user, id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice updated successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        invoiceService.deleteInvoice(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice deleted successfully", null));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    }
}

