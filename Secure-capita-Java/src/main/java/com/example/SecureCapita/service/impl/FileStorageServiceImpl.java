package com.example.SecureCapita.service.impl;

import com.example.SecureCapita.exception.CustomException;
import com.example.SecureCapita.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif"
    );

    private final String uploadDir;

    public FileStorageServiceImpl(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public String storeCustomerImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException("Image file is required", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new CustomException("Only image files are allowed", HttpStatus.BAD_REQUEST);
        }

        try {
            String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
            String safeOriginal = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID() + "_" + safeOriginal;

            Path dir = Paths.get(uploadDir, "customers");
            Files.createDirectories(dir);

            Path path = dir.resolve(fileName);
            Files.write(path, file.getBytes());

            return "/uploads/customers/" + fileName;
        } catch (Exception e) {
            throw new CustomException("Could not upload image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

