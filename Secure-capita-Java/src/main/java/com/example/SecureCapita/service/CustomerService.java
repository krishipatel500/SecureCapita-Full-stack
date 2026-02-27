package com.example.SecureCapita.service;

import com.example.SecureCapita.dto.CreateCustomerRequest;
import com.example.SecureCapita.dto.CustomerResponse;
import com.example.SecureCapita.dto.UpdateCustomerRequest;
import com.example.SecureCapita.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CustomerService {
    Page<CustomerResponse> listCustomers(User user, String search, Pageable pageable);

    CustomerResponse getCustomer(User user, Long customerId);

    CustomerResponse createCustomer(User user, CreateCustomerRequest request);

    CustomerResponse updateCustomer(User user, Long customerId, UpdateCustomerRequest request);

    void deleteCustomer(User user, Long customerId);

    CustomerResponse uploadCustomerImage(User user, Long customerId, MultipartFile file);
}

