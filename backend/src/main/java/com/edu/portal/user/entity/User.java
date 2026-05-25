package com.edu.portal.user.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntity {

    @TableId
    private Long id;

    private String username;

    @JsonIgnore
    private String passwordHash;

    private String displayName;

    private String email;

    private String mobile;

    private String userType;

    private String role;

    private String source;

    private String status;

    private String organization;

    private LocalDateTime lastLoginAt;
}
