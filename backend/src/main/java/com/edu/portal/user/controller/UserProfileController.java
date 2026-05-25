package com.edu.portal.user.controller;

import com.edu.portal.auth.AuthSession;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.common.exception.BusinessException;
import com.edu.portal.user.dto.UserProfileUpdateRequest;
import com.edu.portal.user.entity.User;
import com.edu.portal.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/users")
public class UserProfileController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(HttpServletRequest request) {
        User user = currentUser(request);
        return ApiResponse.ok(Map.of(
                "user", user,
                "roles", userService.roleCodes(user.getId()),
                "permissions", userService.permissionCodes(user.getId())
        ));
    }

    @PutMapping("/me/profile")
    public ApiResponse<User> updateProfile(HttpServletRequest servletRequest,
                                           @Valid @RequestBody UserProfileUpdateRequest request) {
        User user = currentUser(servletRequest);
        BeanUtils.copyProperties(request, user);
        userService.updateById(user);
        return ApiResponse.ok(user);
    }

    private User currentUser(HttpServletRequest request) {
        AuthSession session = AuthSession.fromRequest(request)
                .orElseThrow(() -> new BusinessException(401, "AUTH_REQUIRED"));
        return userService.activeUser(session.userId());
    }
}
