package com.edu.portal.audit.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.audit.entity.AuditLog;
import com.edu.portal.common.dto.PageQuery;

import java.time.LocalDateTime;

public interface AuditLogService extends IService<AuditLog> {

    IPage<AuditLog> pageLogs(PageQuery pageQuery, String action, String targetType, Long actorUserId,
                             LocalDateTime startAt, LocalDateTime endAt);

    void record(Long actorUserId, String action, String targetType, Long targetId, Object before, Object after);
}
