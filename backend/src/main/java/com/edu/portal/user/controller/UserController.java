package com.edu.portal.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.user.dto.UserCreateRequest;
import com.edu.portal.user.dto.UserQuery;
import com.edu.portal.user.dto.UserStatusUpdateRequest;
import com.edu.portal.user.dto.UserUpdateRequest;
import com.edu.portal.user.entity.User;
import com.edu.portal.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<IPage<User>> pageUsers(@Valid UserQuery query) {
        return ApiResponse.ok(userService.pageUsers(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUser(@PathVariable @Min(1) Long id) {
        return ApiResponse.ok(userService.getById(id));
    }

    @PostMapping
    public ApiResponse<User> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ApiResponse.ok(userService.createUser(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable @Min(1) Long id,
                                        @Valid @RequestBody UserUpdateRequest request) {
        return ApiResponse.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<User> updateStatus(@PathVariable @Min(1) Long id,
                                          @Valid @RequestBody UserStatusUpdateRequest request) {
        return ApiResponse.ok(userService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable @Min(1) Long id) {
        userService.removeById(id);
        return ApiResponse.ok();
    }
}
