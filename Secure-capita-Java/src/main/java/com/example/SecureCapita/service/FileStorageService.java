package com.example.SecureCapita.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Stores the file under the local uploads folder and returns a public URL path.
     * Example return value: "/uploads/customers/<fileName>"
     */
    String storeCustomerImage(MultipartFile file);
}

