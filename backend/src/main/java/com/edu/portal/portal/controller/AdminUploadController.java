package com.edu.portal.portal.controller;

import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.common.exception.BusinessException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/uploads")
public class AdminUploadController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final long MAX_IMAGE_BYTES = 5L * 1024L * 1024L;

    @PostMapping("/images")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file,
                                                        @RequestParam(defaultValue = "banners") String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "UPLOAD_FILE_REQUIRED");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new BusinessException(400, "UPLOAD_FILE_TOO_LARGE");
        }

        String extension = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(400, "UPLOAD_FILE_TYPE_NOT_ALLOWED");
        }

        String safeFolder = safeFolder(folder);
        String datePath = LocalDate.now().toString();
        String filename = UUID.randomUUID() + "." + extension;
        Path targetDir = Path.of("uploads", safeFolder, datePath).toAbsolutePath().normalize();
        Path target = targetDir.resolve(filename).normalize();

        try {
            Files.createDirectories(targetDir);
            file.transferTo(target);
        } catch (IOException ex) {
            throw new BusinessException(500, "UPLOAD_FILE_FAILED");
        }

        String url = "/api/uploads/" + safeFolder + "/" + datePath + "/" + filename;
        return ApiResponse.ok(Map.of("url", url));
    }

    private String extensionOf(String filename) {
        String value = StringUtils.hasText(filename) ? filename : "";
        int dotIndex = value.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == value.length() - 1) {
            throw new BusinessException(400, "UPLOAD_FILE_TYPE_NOT_ALLOWED");
        }
        return value.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String safeFolder(String folder) {
        String value = StringUtils.hasText(folder) ? folder.trim().toLowerCase(Locale.ROOT) : "banners";
        return value.replaceAll("[^a-z0-9_-]", "");
    }
}
