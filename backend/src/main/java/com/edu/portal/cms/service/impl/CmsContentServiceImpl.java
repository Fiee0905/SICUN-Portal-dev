package com.edu.portal.cms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.cms.dto.CmsContentCreateRequest;
import com.edu.portal.cms.dto.CmsContentQuery;
import com.edu.portal.cms.dto.CmsContentUpdateRequest;
import com.edu.portal.cms.entity.CmsCategory;
import com.edu.portal.cms.entity.CmsContent;
import com.edu.portal.cms.mapper.CmsContentMapper;
import com.edu.portal.cms.service.CmsCategoryService;
import com.edu.portal.cms.service.CmsContentService;
import com.edu.portal.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CmsContentServiceImpl extends ServiceImpl<CmsContentMapper, CmsContent> implements CmsContentService {

    private final CmsCategoryService cmsCategoryService;

    @Override
    public IPage<CmsContent> pageContents(CmsContentQuery query) {
        LambdaQueryWrapper<CmsContent> wrapper = new LambdaQueryWrapper<CmsContent>()
                .eq(StringUtils.hasText(query.getStatus()), CmsContent::getStatus, query.getStatus())
                .eq(query.getCategoryId() != null, CmsContent::getCategoryId, query.getCategoryId())
                .inSql(StringUtils.hasText(query.getCategoryCode()), CmsContent::getCategoryId,
                        "select id from cms_category where code = '" + query.getCategoryCode().replace("'", "''") + "' and enabled = 1 and deleted = 0")
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(CmsContent::getTitle, query.getKeyword())
                        .or()
                        .like(CmsContent::getSlug, query.getKeyword())
                        .or()
                        .like(CmsContent::getAuthor, query.getKeyword()))
                .orderByDesc(CmsContent::getId);
        IPage<CmsContent> result = page(new Page<>(query.getPage(), query.getSize()), wrapper);
        fillCategoryMetadata(result.getRecords());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CmsContent createContent(CmsContentCreateRequest request) {
        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug().trim() : generateSlug(request.getTitle());
        boolean duplicated = lambdaQuery().eq(CmsContent::getSlug, slug).exists();
        if (duplicated) {
            throw new BusinessException("Content slug already exists");
        }

        CmsContent content = new CmsContent();
        BeanUtils.copyProperties(request, content);
        content.setSlug(slug);
        content.setCategoryId(resolveCategoryId(request.getCategoryId(), request.getCategoryCode()));
        if (!StringUtils.hasText(content.getContent())) {
            content.setContent("");
        }
        if ("PUBLISHED".equalsIgnoreCase(content.getStatus())) {
            content.setStatus("PUBLISHED");
            content.setPublishedAt(LocalDateTime.now());
        }
        save(content);
        fillCategoryMetadata(List.of(content));
        return content;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CmsContent updateContent(Long id, CmsContentUpdateRequest request) {
        CmsContent content = getById(id);
        if (content == null) {
            throw new BusinessException(404, "Content not found");
        }

        String previousStatus = content.getStatus();
        Long previousCategoryId = content.getCategoryId();
        BeanUtils.copyProperties(request, content);
        if (request.getCategoryId() != null || StringUtils.hasText(request.getCategoryCode())) {
            content.setCategoryId(resolveCategoryId(request.getCategoryId(), request.getCategoryCode()));
        } else {
            content.setCategoryId(previousCategoryId);
        }
        if (!"PUBLISHED".equalsIgnoreCase(previousStatus) && "PUBLISHED".equalsIgnoreCase(content.getStatus())) {
            content.setStatus("PUBLISHED");
            content.setPublishedAt(LocalDateTime.now());
        }
        updateById(content);
        fillCategoryMetadata(List.of(content));
        return content;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CmsContent changeStatus(Long id, String targetStatus) {
        CmsContent content = getById(id);
        if (content == null) {
            throw new BusinessException(404, "Content not found");
        }
        String sourceStatus = content.getStatus();
        if (!canTransit(sourceStatus, targetStatus)) {
            throw new BusinessException(409, "Invalid article status transition: " + sourceStatus + " -> " + targetStatus);
        }
        content.setStatus(targetStatus);
        if ("PUBLISHED".equals(targetStatus)) {
            content.setPublishedAt(LocalDateTime.now());
        }
        if ("OFFLINE".equals(targetStatus)) {
            content.setOfflineAt(LocalDateTime.now());
        }
        updateById(content);
        fillCategoryMetadata(List.of(content));
        return content;
    }

    private boolean canTransit(String sourceStatus, String targetStatus) {
        if ("PENDING_REVIEW".equals(targetStatus)) {
            return "DRAFT".equals(sourceStatus) || "REJECTED".equals(sourceStatus) || "OFFLINE".equals(sourceStatus);
        }
        if ("APPROVED".equals(targetStatus) || "REJECTED".equals(targetStatus)) {
            return "PENDING_REVIEW".equals(sourceStatus);
        }
        if ("PUBLISHED".equals(targetStatus)) {
            return List.of("DRAFT", "PENDING_REVIEW", "REJECTED", "APPROVED", "OFFLINE").contains(sourceStatus);
        }
        if ("OFFLINE".equals(targetStatus)) {
            return "PUBLISHED".equals(sourceStatus);
        }
        return false;
    }

    private Long resolveCategoryId(Long categoryId, String categoryCode) {
        if (categoryId != null) {
            return categoryId;
        }
        if (!StringUtils.hasText(categoryCode)) {
            throw new BusinessException("Article category is required");
        }
        CmsCategory category = cmsCategoryService.getEnabledByCode(categoryCode.trim());
        if (category == null) {
            throw new BusinessException(404, "Article category not found");
        }
        return category.getId();
    }

    private String generateSlug(String title) {
        String base = StringUtils.hasText(title)
                ? title.trim().toLowerCase().replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
                : "article";
        base = base.replaceAll("^-+|-+$", "");
        if (!StringUtils.hasText(base)) {
            base = "article";
        }
        String slug = base;
        int suffix = 1;
        while (lambdaQuery().eq(CmsContent::getSlug, slug).exists()) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    private void fillCategoryMetadata(List<CmsContent> records) {
        if (records == null || records.isEmpty()) {
            return;
        }
        List<Long> categoryIds = records.stream()
                .map(CmsContent::getCategoryId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Map<Long, CmsCategory> categoryMap = categoryIds.isEmpty()
                ? Collections.emptyMap()
                : cmsCategoryService.listByIds(categoryIds).stream()
                        .collect(Collectors.toMap(CmsCategory::getId, Function.identity()));
        for (CmsContent content : records) {
            CmsCategory category = categoryMap.get(content.getCategoryId());
            if (category != null) {
                content.setCategoryCode(category.getCode());
                content.setCategoryName(category.getName());
            }
        }
    }
}
