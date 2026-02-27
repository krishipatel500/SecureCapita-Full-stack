package com.example.SecureCapita.service.impl;

import com.example.SecureCapita.dto.CreateCustomerRequest;
import com.example.SecureCapita.dto.CustomerResponse;
import com.example.SecureCapita.dto.UpdateCustomerRequest;
import com.example.SecureCapita.entity.Customer;
import com.example.SecureCapita.entity.User;
import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.repository.CustomerRepository;
import com.example.SecureCapita.service.CustomerService;
import com.example.SecureCapita.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final FileStorageService fileStorageService;

    @Override
    public Page<CustomerResponse> listCustomers(User user, String search, Pageable pageable) {
        Page<Customer> page;
        if (search != null && !search.trim().isEmpty()) {
            page = customerRepository.findByNameContainingIgnoreCaseAndUser(search.trim(), user, pageable);
        } else {
            page = customerRepository.findByUser(user, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    public CustomerResponse getCustomer(User user, Long customerId) {
        Customer customer = customerRepository.findByIdAndUser(customerId, user)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));
        return toResponse(customer);
    }

    @Override
    public CustomerResponse createCustomer(User user, CreateCustomerRequest request) {

        if (customerRepository.existsByEmailAndUser(request.getEmail(), user)) {
            throw new CustomException("Customer email already exists", HttpStatus.CONFLICT);
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .address(request.getAddress())
                .phone(request.getPhone())
                .type(request.getType())
                .status(request.getStatus())
                .imageUrl(request.getImageUrl())   // ✅ ADD THIS LINE
                .user(user)
                .build();

        Customer saved = customerRepository.save(customer);

        return toResponse(saved);
    }

    @Override
    public CustomerResponse updateCustomer(User user, Long customerId, UpdateCustomerRequest request) {

        Customer customer = customerRepository.findByIdAndUser(customerId, user)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));

        if (request.getName() != null) customer.setName(request.getName());
        if (request.getEmail() != null) customer.setEmail(request.getEmail());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getType() != null) customer.setType(request.getType());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());
        if (request.getImageUrl() != null) customer.setImageUrl(request.getImageUrl());  // ✅ ADD THIS

        Customer saved = customerRepository.save(customer);

        return toResponse(saved);
    }

    @Override
    public void deleteCustomer(User user, Long customerId) {
        Customer customer = customerRepository.findByIdAndUser(customerId, user)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));
        customerRepository.delete(customer);
    }

    @Override
    public CustomerResponse uploadCustomerImage(User user, Long customerId, MultipartFile file) {
        Customer customer = customerRepository.findByIdAndUser(customerId, user)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));

        String imageUrl = fileStorageService.storeCustomerImage(file);
        customer.setImageUrl(imageUrl);
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .address(c.getAddress())
                .phone(c.getPhone())
                .type(c.getType())
                .status(c.getStatus())
                .imageUrl(c.getImageUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

