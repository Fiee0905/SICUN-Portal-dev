package com.edu.portal.auth.controller;

import com.edu.portal.auth.AuthSession;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.common.exception.BusinessException;
import com.edu.portal.config.ExternalIntegrationProperties;
import com.edu.portal.user.dto.UserCreateRequest;
import com.edu.portal.user.entity.User;
import com.edu.portal.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
public class AuthController {

    private final UserService userService;
    private final ExternalIntegrationProperties integrationProperties;

    @GetMapping("/cas/login-url")
    public ApiResponse<Map<String, String>> casLoginUrl(@RequestParam String redirectUri) {
        String casLoginUrl = integrationProperties.getCas().getLoginUrl();
        if (!StringUtils.hasText(casLoginUrl)) {
            throw new BusinessException(500, "CAS login URL is not configured");
        }
        String loginUrl = UriComponentsBuilder.fromUriString(casLoginUrl)
                .queryParam("service", redirectUri)
                .build()
                .encode()
                .toUriString();
        return ApiResponse.ok(Map.of("loginUrl", loginUrl));
    }

    @PostMapping("/cas/callback")
    public ApiResponse<LoginResponse> casCallback(@Valid @RequestBody CasCallbackRequest request) {
        throw new BusinessException(401, "CAS ticket validation is not configured");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.username(), request.password());
        return ApiResponse.ok(LoginResponse.of(safeUser(user)));
    }

    @PostMapping("/register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterRequest request) {
        UserCreateRequest userRequest = new UserCreateRequest();
        userRequest.setUsername(request.username());
        userRequest.setPassword(request.password());
        userRequest.setDisplayName(request.displayName());
        userRequest.setEmail(request.email());
        userRequest.setMobile(request.mobile());
        userRequest.setOrganization(request.organization());
        User user = userService.registerExternal(userRequest);
        return ApiResponse.ok(user);
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refresh() {
        return ApiResponse.ok(Map.of("accessToken", "", "expiresIn", 7200));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok();
    }

    private static LoginUser safeUser(User user) {
        return new LoginUser(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole(),
                user.getUserType(),
                user.getSource(),
                user.getStatus(),
                user.getEmail(),
                user.getMobile(),
                user.getOrganization()
        );
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record CasCallbackRequest(@NotBlank String ticket, @NotBlank String service) {
    }

    public record RegisterRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String displayName,
            String email,
            String mobile,
            String organization) {
    }

    public record LoginUser(Long id, String username, String displayName, String role, String userType, String source,
                            String status, String email, String mobile, String organization) {
    }

    public record LoginResponse(String accessToken, String refreshToken, long expiresIn, LoginUser user, Instant issuedAt) {
        static LoginResponse of(LoginUser user) {
            return new LoginResponse(
                    AuthSession.issue(user.id(), user.username(), user.role()),
                    AuthSession.issue(user.id(), user.username(), user.role()),
                    7200,
                    user,
                    Instant.now()
            );
        }
    }
}
