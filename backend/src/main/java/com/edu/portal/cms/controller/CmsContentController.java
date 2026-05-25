package com.edu.portal.cms.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.edu.portal.cms.dto.CmsContentCreateRequest;
import com.edu.portal.cms.dto.CmsContentQuery;
import com.edu.portal.cms.dto.CmsContentUpdateRequest;
import com.edu.portal.cms.entity.CmsCategory;
import com.edu.portal.cms.entity.CmsContent;
import com.edu.portal.cms.service.CmsCategoryService;
import com.edu.portal.cms.service.CmsContentService;
import com.edu.portal.audit.service.AuditLogService;
import com.edu.portal.common.api.ApiResponse;
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
@RequestMapping("/v1/admin/articles")
public class CmsContentController {

    private final CmsContentService cmsContentService;
    private final CmsCategoryService cmsCategoryService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<IPage<CmsContent>> pageContents(@Valid CmsContentQuery query) {
        return ApiResponse.ok(cmsContentService.pageContents(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<CmsContent> getContent(@PathVariable @Min(1) Long id) {
        CmsContent content = cmsContentService.getById(id);
        fillCategoryMetadata(content);
        return ApiResponse.ok(content);
    }

    @PostMapping
    public ApiResponse<CmsContent> createContent(@Valid @RequestBody CmsContentCreateRequest request) {
        CmsContent content = cmsContentService.createContent(request);
        auditLogService.record(null, "ARTICLE_CREATE", "CMS_ARTICLE", content.getId(), null, content);
        return ApiResponse.ok(content);
    }

    @PutMapping("/{id}")
    public ApiResponse<CmsContent> updateContent(@PathVariable @Min(1) Long id,
                                                @Valid @RequestBody CmsContentUpdateRequest request) {
        CmsContent before = cmsContentService.getById(id);
        CmsContent content = cmsContentService.updateContent(id, request);
        auditLogService.record(null, "ARTICLE_UPDATE", "CMS_ARTICLE", id, before, content);
        return ApiResponse.ok(content);
    }

    @PostMapping("/{id}/submit")
    public ApiResponse<CmsContent> submit(@PathVariable @Min(1) Long id) {
        return changeStatus(id, "PENDING_REVIEW", "ARTICLE_SUBMIT");
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<CmsContent> approve(@PathVariable @Min(1) Long id) {
        return changeStatus(id, "APPROVED", "ARTICLE_APPROVE");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<CmsContent> reject(@PathVariable @Min(1) Long id) {
        return changeStatus(id, "REJECTED", "ARTICLE_REJECT");
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<CmsContent> publish(@PathVariable @Min(1) Long id) {
        return changeStatus(id, "PUBLISHED", "ARTICLE_PUBLISH");
    }

    @PostMapping("/{id}/offline")
    public ApiResponse<CmsContent> offline(@PathVariable @Min(1) Long id) {
        return changeStatus(id, "OFFLINE", "ARTICLE_OFFLINE");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteContent(@PathVariable @Min(1) Long id) {
        CmsContent before = cmsContentService.getById(id);
        cmsContentService.removeById(id);
        auditLogService.record(null, "ARTICLE_DELETE", "CMS_ARTICLE", id, before, null);
        return ApiResponse.ok();
    }

    private ApiResponse<CmsContent> changeStatus(Long id, String status, String action) {
        CmsContent before = cmsContentService.getById(id);
        CmsContent content = cmsContentService.changeStatus(id, status);
        auditLogService.record(null, action, "CMS_ARTICLE", id, before, content);
        return ApiResponse.ok(content);
    }

    private void fillCategoryMetadata(CmsContent content) {
        if (content == null || content.getCategoryId() == null) {
            return;
        }
        CmsCategory category = cmsCategoryService.getById(content.getCategoryId());
        if (category != null) {
            content.setCategoryCode(category.getCode());
            content.setCategoryName(category.getName());
        }
    }
}
