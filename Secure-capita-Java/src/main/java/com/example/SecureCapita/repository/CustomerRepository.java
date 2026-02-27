package com.example.SecureCapita.repository;

import com.example.SecureCapita.entity.Customer;
import com.example.SecureCapita.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByUser(User user, Pageable pageable);

    Page<Customer> findByNameContainingIgnoreCaseAndUser(String name, User user, Pageable pageable);

    Optional<Customer> findByIdAndUser(Long id, User user);

    boolean existsByEmailAndUser(String email, User user);
}