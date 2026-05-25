package com.edu.portal.portal.controller;

import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.portal.entity.PortalBanner;
import com.edu.portal.portal.entity.PortalCollege;
import com.edu.portal.portal.entity.PortalFriendLink;
import com.edu.portal.portal.entity.PortalPageConfig;
import com.edu.portal.portal.entity.PortalQuickLink;
import com.edu.portal.portal.entity.PortalSiteConfig;
import com.edu.portal.portal.entity.PortalTeacher;
import com.edu.portal.portal.service.PortalBannerService;
import com.edu.portal.portal.service.PortalCollegeService;
import com.edu.portal.portal.service.PortalFriendLinkService;
import com.edu.portal.portal.service.PortalPageConfigService;
import com.edu.portal.portal.service.PortalQuickLinkService;
import com.edu.portal.portal.service.PortalSiteConfigService;
import com.edu.portal.portal.service.PortalTeacherService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin")
public class PortalAdminController {

    private final PortalBannerService bannerService;
    private final PortalCollegeService collegeService;
    private final PortalQuickLinkService quickLinkService;
    private final PortalFriendLinkService friendLinkService;
    private final PortalTeacherService teacherService;
    private final PortalSiteConfigService siteConfigService;
    private final PortalPageConfigService pageConfigService;

    @GetMapping("/banners")
    public ApiResponse<List<PortalBanner>> banners(@RequestParam(required = false) String position) {
        String normalizedPosition = normalizeBannerPosition(position);
        if (position == null || position.isBlank()) {
            return ApiResponse.ok(bannerService.lambdaQuery()
                    .orderByAsc(PortalBanner::getSortOrder)
                    .orderByDesc(PortalBanner::getId)
                    .list());
        }
        return ApiResponse.ok(bannerService.lambdaQuery()
                .eq(PortalBanner::getPosition, normalizedPosition)
                .orderByAsc(PortalBanner::getSortOrder)
                .orderByDesc(PortalBanner::getId)
                .list());
    }

    @PostMapping("/banners")
    public ApiResponse<PortalBanner> createBanner(@RequestBody PortalBanner banner) {
        banner.setId(null);
        banner.setPosition(normalizeBannerPosition(banner.getPosition()));
        if (banner.getSortOrder() == null) {
            banner.setSortOrder(0);
        }
        if (banner.getEnabled() == null) {
            banner.setEnabled(true);
        }
        bannerService.save(banner);
        return ApiResponse.ok(banner);
    }

    @PutMapping("/banners/{id}")
    public ApiResponse<PortalBanner> updateBanner(@PathVariable @Min(1) Long id, @RequestBody PortalBanner banner) {
        banner.setId(id);
        banner.setPosition(normalizeBannerPosition(banner.getPosition()));
        bannerService.updateById(banner);
        return ApiResponse.ok(bannerService.getById(id));
    }

    @DeleteMapping("/banners/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable @Min(1) Long id) {
        bannerService.removeById(id);
        return ApiResponse.ok();
    }

    @GetMapping("/quick-links")
    public ApiResponse<List<PortalQuickLink>> quickLinks() {
        return ApiResponse.ok(quickLinkService.lambdaQuery()
                .orderByAsc(PortalQuickLink::getSortOrder)
                .orderByDesc(PortalQuickLink::getId)
                .list());
    }

    @PostMapping("/quick-links")
    public ApiResponse<PortalQuickLink> createQuickLink(@RequestBody PortalQuickLink link) {
        quickLinkService.save(link);
        return ApiResponse.ok(link);
    }

    @PutMapping("/quick-links/{id}")
    public ApiResponse<PortalQuickLink> updateQuickLink(@PathVariable @Min(1) Long id, @RequestBody PortalQuickLink link) {
        link.setId(id);
        quickLinkService.updateById(link);
        return ApiResponse.ok(quickLinkService.getById(id));
    }

    @DeleteMapping("/quick-links/{id}")
    public ApiResponse<Void> deleteQuickLink(@PathVariable @Min(1) Long id) {
        quickLinkService.removeById(id);
        return ApiResponse.ok();
    }

    @GetMapping("/colleges")
    public ApiResponse<List<PortalCollege>> colleges(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(collegeService.lambdaQuery()
                .eq(PortalCollege::getSiteCode, defaultSiteCode(siteCode))
                .orderByAsc(PortalCollege::getSortOrder)
                .orderByDesc(PortalCollege::getId)
                .list());
    }

    @PostMapping("/colleges")
    public ApiResponse<PortalCollege> createCollege(@RequestBody PortalCollege college) {
        college.setId(null);
        normalizeCollege(college);
        collegeService.save(college);
        return ApiResponse.ok(college);
    }

    @PutMapping("/colleges/{id}")
    public ApiResponse<PortalCollege> updateCollege(@PathVariable @Min(1) Long id,
                                                    @RequestBody PortalCollege college) {
        college.setId(id);
        normalizeCollege(college);
        collegeService.updateById(college);
        return ApiResponse.ok(collegeService.getById(id));
    }

    @DeleteMapping("/colleges/{id}")
    public ApiResponse<Void> deleteCollege(@PathVariable @Min(1) Long id) {
        collegeService.removeById(id);
        return ApiResponse.ok();
    }

    @GetMapping("/friend-links")
    public ApiResponse<List<PortalFriendLink>> friendLinks(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(friendLinkService.lambdaQuery()
                .eq(PortalFriendLink::getSiteCode, defaultSiteCode(siteCode))
                .orderByAsc(PortalFriendLink::getSortOrder)
                .orderByDesc(PortalFriendLink::getId)
                .list());
    }

    @PostMapping("/friend-links")
    public ApiResponse<PortalFriendLink> createFriendLink(@RequestBody PortalFriendLink link) {
        link.setId(null);
        link.setSiteCode(defaultSiteCode(link.getSiteCode()));
        link.setEnabled(link.getEnabled() == null || link.getEnabled());
        if (link.getSortOrder() == null) {
            link.setSortOrder(0);
        }
        friendLinkService.save(link);
        return ApiResponse.ok(link);
    }

    @PutMapping("/friend-links/{id}")
    public ApiResponse<PortalFriendLink> updateFriendLink(@PathVariable @Min(1) Long id,
                                                          @RequestBody PortalFriendLink link) {
        link.setId(id);
        link.setSiteCode(defaultSiteCode(link.getSiteCode()));
        if (link.getSortOrder() == null) {
            link.setSortOrder(0);
        }
        friendLinkService.updateById(link);
        return ApiResponse.ok(friendLinkService.getById(id));
    }

    @DeleteMapping("/friend-links/{id}")
    public ApiResponse<Void> deleteFriendLink(@PathVariable @Min(1) Long id) {
        friendLinkService.removeById(id);
        return ApiResponse.ok();
    }

    @GetMapping("/teachers")
    public ApiResponse<List<PortalTeacher>> teachers(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(teacherService.lambdaQuery()
                .eq(PortalTeacher::getSiteCode, defaultSiteCode(siteCode))
                .orderByAsc(PortalTeacher::getSortOrder)
                .orderByDesc(PortalTeacher::getId)
                .list());
    }

    @PostMapping("/teachers")
    public ApiResponse<PortalTeacher> createTeacher(@RequestBody PortalTeacher teacher) {
        teacher.setId(null);
        normalizeTeacher(teacher);
        teacherService.save(teacher);
        return ApiResponse.ok(teacher);
    }

    @PutMapping("/teachers/{id}")
    public ApiResponse<PortalTeacher> updateTeacher(@PathVariable @Min(1) Long id,
                                                    @RequestBody PortalTeacher teacher) {
        teacher.setId(id);
        normalizeTeacher(teacher);
        teacherService.updateById(teacher);
        return ApiResponse.ok(teacherService.getById(id));
    }

    @DeleteMapping("/teachers/{id}")
    public ApiResponse<Void> deleteTeacher(@PathVariable @Min(1) Long id) {
        teacherService.removeById(id);
        return ApiResponse.ok();
    }

    @GetMapping("/site-config")
    public ApiResponse<Map<String, Object>> siteConfig(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(siteConfigService.configMap(siteCode));
    }

    @PutMapping("/site-config")
    public ApiResponse<PortalSiteConfig> upsertSiteConfig(@RequestBody PortalSiteConfig config) {
        config.setSiteCode(defaultSiteCode(config.getSiteCode()));
        boolean exists = siteConfigService.lambdaQuery()
                .eq(PortalSiteConfig::getSiteCode, config.getSiteCode())
                .eq(PortalSiteConfig::getConfigKey, config.getConfigKey())
                .exists();
        if (exists) {
            siteConfigService.lambdaUpdate()
                    .eq(PortalSiteConfig::getSiteCode, config.getSiteCode())
                    .eq(PortalSiteConfig::getConfigKey, config.getConfigKey())
                    .set(PortalSiteConfig::getConfigValue, config.getConfigValue())
                    .set(PortalSiteConfig::getValueType, config.getValueType())
                    .set(PortalSiteConfig::getDescription, config.getDescription())
                    .update();
            return ApiResponse.ok(siteConfigService.lambdaQuery()
                    .eq(PortalSiteConfig::getSiteCode, config.getSiteCode())
                    .eq(PortalSiteConfig::getConfigKey, config.getConfigKey())
                    .one());
        }
        siteConfigService.save(config);
        return ApiResponse.ok(config);
    }

    @GetMapping("/page-config/{pageCode}")
    public ApiResponse<PortalPageConfig> pageConfig(@PathVariable String pageCode,
                                                    @RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(pageConfigService.lambdaQuery()
                .eq(PortalPageConfig::getSiteCode, defaultSiteCode(siteCode))
                .eq(PortalPageConfig::getPageCode, pageCode)
                .one());
    }

    @PutMapping("/page-config/{pageCode}")
    public ApiResponse<PortalPageConfig> upsertPageConfig(@PathVariable String pageCode,
                                                          @RequestParam(defaultValue = "main") String siteCode,
                                                          @RequestBody PortalPageConfig config) {
        config.setSiteCode(defaultSiteCode(siteCode));
        config.setPageCode(pageCode);
        PortalPageConfig existing = pageConfigService.lambdaQuery()
                .eq(PortalPageConfig::getSiteCode, config.getSiteCode())
                .eq(PortalPageConfig::getPageCode, pageCode)
                .one();
        if (existing == null) {
            pageConfigService.save(config);
            return ApiResponse.ok(config);
        }
        config.setId(existing.getId());
        pageConfigService.updateById(config);
        return ApiResponse.ok(pageConfigService.getById(existing.getId()));
    }

    private String defaultSiteCode(String siteCode) {
        return StringUtils.hasText(siteCode) ? siteCode : "main";
    }

    private String normalizeBannerPosition(String position) {
        if (!StringUtils.hasText(position)) {
            return "HOME_TOP";
        }
        String value = position.trim();
        if ("home".equalsIgnoreCase(value)) {
            return "HOME_TOP";
        }
        return value.toUpperCase();
    }

    private void normalizeTeacher(PortalTeacher teacher) {
        teacher.setSiteCode(defaultSiteCode(teacher.getSiteCode()));
        if (teacher.getSortOrder() == null) {
            teacher.setSortOrder(0);
        }
        if (teacher.getCourseCount() == null) {
            teacher.setCourseCount(0);
        }
        if (teacher.getEnabled() == null) {
            teacher.setEnabled(true);
        }
    }

    private void normalizeCollege(PortalCollege college) {
        college.setSiteCode(defaultSiteCode(college.getSiteCode()));
        if (college.getSortOrder() == null) {
            college.setSortOrder(0);
        }
        if (college.getEnabled() == null) {
            college.setEnabled(true);
        }
    }
}
