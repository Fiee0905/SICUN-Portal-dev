package com.edu.portal.audit.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.edu.portal.audit.entity.AuditLog;
import com.edu.portal.audit.service.AuditLogService;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.common.dto.PageQuery;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin/logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<IPage<AuditLog>> pageLogs(@Valid PageQuery pageQuery,
                                                 @RequestParam(required = false) String action,
                                                 @RequestParam(required = false) String targetType,
                                                 @RequestParam(required = false) Long actorUserId,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAt,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endAt) {
        return ApiResponse.ok(auditLogService.pageLogs(pageQuery, action, targetType, actorUserId, startAt, endAt));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLogs(@Valid PageQuery pageQuery,
                                             @RequestParam(required = false) String action,
                                             @RequestParam(required = false) String targetType,
                                             @RequestParam(required = false) Long actorUserId,
                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAt,
                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endAt) {
        pageQuery.setSize(Math.min(pageQuery.getSize(), 1000));
        IPage<AuditLog> logs = auditLogService.pageLogs(pageQuery, action, targetType, actorUserId, startAt, endAt);
        String csv = "id,actorUserId,action,targetType,targetId,createdAt\n" + logs.getRecords().stream()
                .map(log -> "%s,%s,%s,%s,%s,%s".formatted(
                        log.getId(),
                        log.getActorUserId(),
                        csv(log.getAction()),
                        csv(log.getTargetType()),
                        log.getTargetId(),
                        log.getCreatedAt()))
                .collect(Collectors.joining("\n"));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-logs.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}
