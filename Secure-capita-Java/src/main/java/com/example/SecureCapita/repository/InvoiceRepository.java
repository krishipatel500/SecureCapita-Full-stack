package com.example.SecureCapita.repository;

import com.example.SecureCapita.entity.Invoice;
import com.example.SecureCapita.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByCustomer_User(User user, Pageable pageable);

    Page<Invoice> findByCustomer_IdAndCustomer_User(Long customerId, User user, Pageable pageable);

    Optional<Invoice> findByIdAndCustomer_User(Long id, User user);

    Optional<Invoice> findByInvoiceNumberAndCustomer_User(String invoiceNumber, User user);

    boolean existsByInvoiceNumber(String invoiceNumber);
}

