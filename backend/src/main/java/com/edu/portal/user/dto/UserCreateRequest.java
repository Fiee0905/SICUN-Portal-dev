package com.edu.portal.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String displayName;

    private String password;

    @Email
    private String email;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "must be a valid mobile number")
    private String mobile;

    private String userType = "GUEST";

    private String role = "external";

    private String source = "LOCAL";

    private String organization;

    private String status = "ACTIVE";
}
