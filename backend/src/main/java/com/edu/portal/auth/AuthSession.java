package com.edu.portal.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

public record AuthSession(Long userId, String username, String role) {

    private static final String PREFIX = "dev.";

    public static String issue(Long userId, String username, String role) {
        String payload = userId + ":" + username + ":" + role + ":" + UUID.randomUUID();
        return PREFIX + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    public static Optional<AuthSession> fromRequest(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (!StringUtils.hasText(authorization) || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return parse(authorization.substring("Bearer ".length()));
    }

    public static Optional<AuthSession> parse(String token) {
        if (!StringUtils.hasText(token) || !token.startsWith(PREFIX)) {
            return Optional.empty();
        }
        try {
            String encoded = token.substring(PREFIX.length());
            String payload = new String(Base64.getUrlDecoder().decode(encoded), StandardCharsets.UTF_8);
            String[] parts = payload.split(":", 4);
            if (parts.length < 3) {
                return Optional.empty();
            }
            return Optional.of(new AuthSession(Long.parseLong(parts[0]), parts[1], parts[2]));
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }
}
