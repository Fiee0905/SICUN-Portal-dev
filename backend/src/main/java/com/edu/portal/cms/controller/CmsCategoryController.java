package com.edu.portal.cms.controller;

import com.edu.portal.cms.entity.CmsCategory;
import com.edu.portal.cms.service.CmsCategoryService;
import com.edu.portal.common.api.ApiResponse;
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

import java.util.Map;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin/categories")
public class CmsCategoryController {

    private final CmsCategoryService categoryService;

    @GetMapping("/tree")
    public ApiResponse<?> tree() {
        return ApiResponse.ok(categoryService.tree(false));
    }

    @PostMapping
    public ApiResponse<CmsCategory> create(@RequestBody CmsCategory category) {
        categoryService.save(category);
        return ApiResponse.ok(category);
    }

    @PutMapping("/{id}")
    public ApiResponse<CmsCategory> update(@PathVariable @Min(1) Long id, @RequestBody CmsCategory category) {
        category.setId(id);
        categoryService.updateById(category);
        return ApiResponse.ok(categoryService.getById(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<CmsCategory> updateStatus(@PathVariable @Min(1) Long id, @RequestBody Map<String, Boolean> payload) {
        CmsCategory category = categoryService.getById(id);
        if (payload.containsKey("enabled")) {
            category.setEnabled(payload.get("enabled"));
        }
        if (payload.containsKey("visible")) {
            category.setVisible(payload.get("visible"));
        }
        categoryService.updateById(category);
        return ApiResponse.ok(category);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable @Min(1) Long id) {
        categoryService.removeById(id);
        return ApiResponse.ok();
    }
}
