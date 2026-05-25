package com.edu.portal.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserUpdateRequest {

    private String displayName;

    @Email
    private String email;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "must be a valid mobile number")
    private String mobile;

    private String userType;

    private String role;

    private String source;

    private String organization;

    private String status;
}
