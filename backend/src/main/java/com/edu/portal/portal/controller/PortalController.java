package com.edu.portal.portal.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.edu.portal.auth.AuthSession;
import com.edu.portal.cms.dto.CmsContentQuery;
import com.edu.portal.cms.entity.CmsContent;
import com.edu.portal.cms.service.CmsCategoryService;
import com.edu.portal.cms.service.CmsContentService;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.common.exception.BusinessException;
import com.edu.portal.config.ExternalIntegrationProperties;
import com.edu.portal.course.dto.CourseQuery;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.service.CourseService;
import com.edu.portal.portal.entity.PortalCollege;
import com.edu.portal.portal.entity.PortalPageConfig;
import com.edu.portal.portal.service.PortalBannerService;
import com.edu.portal.portal.service.PortalCollegeService;
import com.edu.portal.portal.service.PortalFriendLinkService;
import com.edu.portal.portal.service.PortalPageConfigService;
import com.edu.portal.portal.service.PortalQuickLinkService;
import com.edu.portal.portal.service.PortalSiteConfigService;
import com.edu.portal.portal.service.PortalTeacherService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/portal")
public class PortalController {

    private final CourseService courseService;
    private final CmsContentService cmsContentService;
    private final CmsCategoryService cmsCategoryService;
    private final PortalBannerService bannerService;
    private final PortalQuickLinkService quickLinkService;
    private final PortalFriendLinkService friendLinkService;
    private final PortalTeacherService teacherService;
    private final PortalCollegeService collegeService;
    private final PortalSiteConfigService siteConfigService;
    private final PortalPageConfigService pageConfigService;
    private final ExternalIntegrationProperties integrationProperties;

    @GetMapping("/home")
    public ApiResponse<Map<String, Object>> home(HttpServletRequest request) {
        CourseQuery query = new CourseQuery();
        query.setPage(1L);
        query.setSize(6L);
        query.setStatus("ACTIVE");
        query.setFeatured(true);
        query.setPermissions(visiblePermissions(request));
        IPage<Course> courses = courseService.pageCourses(query);

        CourseQuery newCourseQuery = new CourseQuery();
        newCourseQuery.setPage(1L);
        newCourseQuery.setSize(4L);
        newCourseQuery.setStatus("ACTIVE");
        newCourseQuery.setPermissions(visiblePermissions(request));
        newCourseQuery.setSort("latest");
        IPage<Course> newCourses = courseService.pageCourses(newCourseQuery);

        CmsContentQuery newsQuery = publishedCategoryQuery("news", 6);
        CmsContentQuery noticeQuery = publishedCategoryQuery("notice", 6);
        CmsContentQuery topicQuery = publishedCategoryQuery("topic", 4);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteConfig", siteConfigService.configMap("main"));
        data.put("pageConfig", pageConfigService.getEnabledPage("main", "home"));
        data.put("banners", bannerService.activeBanners("HOME_TOP"));
        data.put("quickLinks", quickLinkService.activeLinks());
        data.put("externalLinks", quickLinkService.activeExternalLinks());
        data.put("friendLinks", friendLinkService.activeLinks("main"));
        data.put("teachers", teacherService.activeTeachers("main"));
        data.put("colleges", collegeOptions(request, "main"));
        data.put("courses", courses.getRecords());
        data.put("newCourses", newCourses.getRecords());
        data.put("news", cmsContentService.pageContents(newsQuery).getRecords());
        data.put("notices", cmsContentService.pageContents(noticeQuery).getRecords());
        data.put("topics", cmsContentService.pageContents(topicQuery).getRecords());
        return ApiResponse.ok(data);
    }

    @GetMapping("/courses")
    public ApiResponse<IPage<Course>> courses(CourseQuery query, HttpServletRequest request) {
        query.setStatus(query.getStatus() == null ? "ACTIVE" : query.getStatus());
        query.setPermissions(visiblePermissions(request));
        return ApiResponse.ok(courseService.pageCourses(query));
    }

    @GetMapping("/courses/{id}")
    public ApiResponse<Course> courseDetail(@PathVariable Long id, HttpServletRequest request) {
        Course course = courseService.getById(id);
        if (course == null || !"ACTIVE".equals(course.getStatus())) {
            throw new BusinessException(404, "Course not found");
        }
        if (!canViewCourse(AuthSession.fromRequest(request).orElse(null), course)) {
            throw new BusinessException(403, "No permission to view this course");
        }
        return ApiResponse.ok(course);
    }

    @PostMapping("/courses/{id}/launch")
    public ApiResponse<Map<String, Object>> launchCourse(@PathVariable Long id, HttpServletRequest request) {
        AuthSession session = AuthSession.fromRequest(request).orElse(null);
        if (session == null) {
            throw new BusinessException(401, "Login required to launch course");
        }
        Course course = courseService.getById(id);
        if (course == null || !"ACTIVE".equals(course.getStatus())) {
            throw new BusinessException(404, "Course not found");
        }
        if (!canViewCourse(session, course)) {
            throw new BusinessException(403, "No permission to view this course");
        }
        String launchUrl = StringUtils.hasText(course.getLaunchUrl())
                ? course.getLaunchUrl()
                : fallbackLaunchUrl(course);
        return ApiResponse.ok(Map.of("launchUrl", launchUrl, "expiresAt", LocalDateTime.now().plusMinutes(15)));
    }

    private String fallbackLaunchUrl(Course course) {
        String launchBaseUrl = integrationProperties.getLms().getLaunchBaseUrl();
        if (!StringUtils.hasText(launchBaseUrl)) {
            throw new BusinessException(500, "LMS launch base URL is not configured");
        }
        return UriComponentsBuilder.fromUriString(trimTrailingSlash(launchBaseUrl))
                .path("/courses/{courseId}/launch")
                .buildAndExpand(course.getId())
                .toUriString();
    }

    private String trimTrailingSlash(String value) {
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    @GetMapping("/articles/search")
    public ApiResponse<IPage<CmsContent>> searchArticles(@RequestParam(required = false) String keyword) {
        CmsContentQuery query = new CmsContentQuery();
        query.setKeyword(keyword);
        query.setStatus("PUBLISHED");
        return ApiResponse.ok(cmsContentService.pageContents(query));
    }

    @GetMapping("/categories/{code}/articles")
    public ApiResponse<IPage<CmsContent>> categoryArticles(@PathVariable String code, CmsContentQuery query) {
        query.setCategoryCode(code);
        query.setStatus("PUBLISHED");
        return ApiResponse.ok(cmsContentService.pageContents(query));
    }

    @GetMapping("/articles/{id}")
    public ApiResponse<CmsContent> articleDetail(@PathVariable Long id) {
        CmsContent content = cmsContentService.lambdaQuery()
                .eq(CmsContent::getId, id)
                .eq(CmsContent::getStatus, "PUBLISHED")
                .one();
        if (content != null) {
            content.setViewCount(content.getViewCount() == null ? 1L : content.getViewCount() + 1);
            cmsContentService.updateById(content);
        } else {
            throw new BusinessException(404, "Article not found");
        }
        return ApiResponse.ok(content);
    }

    @GetMapping("/categories/tree")
    public ApiResponse<?> categories() {
        return ApiResponse.ok(cmsCategoryService.tree(true));
    }

    @GetMapping("/site-config")
    public ApiResponse<Map<String, Object>> siteConfig(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(siteConfigService.configMap(siteCode));
    }

    @GetMapping("/friend-links")
    public ApiResponse<?> friendLinks(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(friendLinkService.activeLinks(siteCode));
    }

    @GetMapping("/teachers")
    public ApiResponse<?> teachers(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(teacherService.activeTeachers(siteCode));
    }

    @GetMapping("/colleges")
    public ApiResponse<List<Map<String, Object>>> colleges(HttpServletRequest request,
                                                           @RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(collegeOptions(request, siteCode));
    }

    @GetMapping("/course-categories")
    public ApiResponse<List<String>> courseCategories(HttpServletRequest request) {
        return ApiResponse.ok(aggregateCourseValues(request, Course::getCategory));
    }

    @GetMapping("/course-levels")
    public ApiResponse<List<String>> courseLevels(HttpServletRequest request) {
        return ApiResponse.ok(aggregateCourseValues(request, Course::getCategory));
    }

    @GetMapping("/external-links")
    public ApiResponse<?> externalLinks() {
        return ApiResponse.ok(quickLinkService.activeExternalLinks());
    }

    @GetMapping("/search-keywords")
    public ApiResponse<List<String>> searchKeywords(@RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(siteConfigService.searchKeywords(siteCode));
    }

    @GetMapping("/page-config/{pageCode}")
    public ApiResponse<PortalPageConfig> pageConfig(@PathVariable String pageCode,
                                                    @RequestParam(defaultValue = "main") String siteCode) {
        return ApiResponse.ok(pageConfigService.getEnabledPage(siteCode, pageCode));
    }

    private CmsContentQuery publishedCategoryQuery(String categoryCode, long size) {
        CmsContentQuery query = new CmsContentQuery();
        query.setPage(1L);
        query.setSize(size);
        query.setStatus("PUBLISHED");
        query.setCategoryCode(categoryCode);
        return query;
    }

    private List<Map<String, Object>> collegeOptions(HttpServletRequest request, String siteCode) {
        Map<String, Long> courseCounts = courseService.lambdaQuery()
                .select(Course::getDepartment)
                .eq(Course::getStatus, "ACTIVE")
                .in(Course::getPermission, visiblePermissions(request))
                .list()
                .stream()
                .map(Course::getDepartment)
                .filter(this::hasText)
                .collect(Collectors.groupingBy(String::trim, Collectors.counting()));

        return collegeService.activeColleges(siteCode)
                .stream()
                .map(college -> collegeOption(college, courseCounts.getOrDefault(college.getName(), 0L)))
                .toList();
    }

    private Map<String, Object> collegeOption(PortalCollege college, Long count) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", college.getId());
        item.put("siteCode", college.getSiteCode());
        item.put("name", college.getName());
        item.put("code", college.getCode());
        item.put("description", college.getDescription());
        item.put("sortOrder", college.getSortOrder());
        item.put("enabled", college.getEnabled());
        item.put("count", count);
        return item;
    }

    private List<String> aggregateCourseValues(HttpServletRequest request, java.util.function.Function<Course, String> getter) {
        return courseService.lambdaQuery()
                .select(Course::getCategory)
                .eq(Course::getStatus, "ACTIVE")
                .in(Course::getPermission, visiblePermissions(request))
                .list()
                .stream()
                .map(getter)
                .filter(this::hasText)
                .map(String::trim)
                .distinct()
                .sorted()
                .toList();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private List<String> visiblePermissions(HttpServletRequest request) {
        AuthSession session = AuthSession.fromRequest(request).orElse(null);
        if (session == null) {
            return List.of("public");
        }
        if ("admin".equals(session.role())) {
            return Arrays.asList("public", "internal", "private");
        }
        if ("internal".equals(session.role())) {
            return Arrays.asList("public", "internal");
        }
        return List.of("public");
    }

    private boolean canViewCourse(AuthSession session, Course course) {
        String permission = course.getPermission() == null ? "public" : course.getPermission();
        if ("public".equals(permission)) {
            return true;
        }
        if (session == null) {
            return false;
        }
        if ("admin".equals(session.role())) {
            return true;
        }
        return "internal".equals(permission) && "internal".equals(session.role());
    }
}
