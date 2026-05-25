package com.edu.portal.audit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.edu.portal.audit.entity.AuditLog;
import com.edu.portal.audit.mapper.AuditLogMapper;
import com.edu.portal.audit.service.AuditLogService;
import com.edu.portal.common.dto.PageQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl extends ServiceImpl<AuditLogMapper, AuditLog> implements AuditLogService {

    private final ObjectMapper objectMapper;

    @Override
    public IPage<AuditLog> pageLogs(PageQuery pageQuery, String action, String targetType, Long actorUserId,
                                    LocalDateTime startAt, LocalDateTime endAt) {
        LambdaQueryWrapper<AuditLog> wrapper = new LambdaQueryWrapper<AuditLog>()
                .eq(StringUtils.hasText(action), AuditLog::getAction, action)
                .eq(StringUtils.hasText(targetType), AuditLog::getTargetType, targetType)
                .eq(actorUserId != null, AuditLog::getActorUserId, actorUserId)
                .ge(startAt != null, AuditLog::getCreatedAt, startAt)
                .le(endAt != null, AuditLog::getCreatedAt, endAt)
                .orderByDesc(AuditLog::getCreatedAt)
                .orderByDesc(AuditLog::getId);
        return page(new Page<>(pageQuery.getPage(), pageQuery.getSize()), wrapper);
    }

    @Override
    public void record(Long actorUserId, String action, String targetType, Long targetId, Object before, Object after) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actorUserId);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setBeforeJson(toJson(before));
        log.setAfterJson(toJson(after));
        log.setCreatedAt(LocalDateTime.now());
        save(log);
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "{\"value\":\"" + String.valueOf(value).replace("\"", "\\\"") + "\"}";
        }
    }
}
