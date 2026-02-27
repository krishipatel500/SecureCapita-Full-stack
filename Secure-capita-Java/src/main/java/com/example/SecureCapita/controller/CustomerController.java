package com.example.SecureCapita.controller;

import com.example.SecureCapita.dto.CreateCustomerRequest;
import com.example.SecureCapita.dto.CustomerResponse;
import com.example.SecureCapita.dto.UpdateCustomerRequest;
import com.example.SecureCapita.entity.User;
import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.repository.UserRepository;
import com.example.SecureCapita.response.ApiResponse;
import com.example.SecureCapita.service.CustomerService;
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
import org.springframework.web.multipart.MultipartFile;
import com.example.SecureCapita.dto.CustomerInvoiceSummaryResponse;
import com.example.SecureCapita.service.InvoiceService;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CustomerResponse> data = customerService.listCustomers(user, search, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customers fetched successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> get(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        CustomerResponse data = customerService.getCustomer(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer fetched successfully", data));
    }

    @GetMapping("/{customerId}/invoice-summary")
    public ResponseEntity<ApiResponse<CustomerInvoiceSummaryResponse>> summary(
            @PathVariable Long customerId,
            Authentication authentication
    ) {
        User user = currentUser(authentication);

        CustomerInvoiceSummaryResponse data =
                invoiceService.getCustomerInvoiceSummary(user, customerId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Invoice summary fetched successfully", data)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> create(
            @Valid @RequestBody CreateCustomerRequest request,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        CustomerResponse data = customerService.createCustomer(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Customer created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        CustomerResponse data = customerService.updateCustomer(user, id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer updated successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        customerService.deleteCustomer(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer deleted successfully", null));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<CustomerResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        CustomerResponse data = customerService.uploadCustomerImage(user, id, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer image uploaded successfully", data));
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

