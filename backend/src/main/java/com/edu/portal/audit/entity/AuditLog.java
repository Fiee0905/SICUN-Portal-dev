package com.edu.portal.audit.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cms_audit_log")
public class AuditLog {

    @TableId
    private Long id;

    private Long actorUserId;
    private String action;
    private String targetType;
    private Long targetId;
    private String ipAddress;
    private String userAgent;
    private String beforeJson;
    private String afterJson;
    private LocalDateTime createdAt;
}
