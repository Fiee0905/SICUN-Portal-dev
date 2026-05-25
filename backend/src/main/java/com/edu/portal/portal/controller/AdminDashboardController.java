package com.edu.portal.portal.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edu.portal.audit.entity.AuditLog;
import com.edu.portal.audit.service.AuditLogService;
import com.edu.portal.cms.entity.CmsContent;
import com.edu.portal.cms.service.CmsContentService;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.service.CourseService;
import com.edu.portal.portal.service.PortalCollegeService;
import com.edu.portal.user.entity.User;
import com.edu.portal.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin")
public class AdminDashboardController {

    private final CourseService courseService;
    private final CmsContentService cmsContentService;
    private final UserService userService;
    private final PortalCollegeService collegeService;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats());
        data.put("activities", activities());
        data.put("courseSamples", courseSamples());
        data.put("chartSeries", chartSeries());
        return ApiResponse.ok(data);
    }

    private List<Map<String, Object>> stats() {
        return List.of(
                stat("课程总数", courseService.count(), trendForCourses(), "blue"),
                stat("在线课程", courseService.lambdaQuery().eq(Course::getStatus, "ACTIVE").count(), trendForActiveCourses(), "green"),
                stat("精选课程", courseService.lambdaQuery().eq(Course::getFeatured, true).count(), null, "amber"),
                stat("开课单位", collegeService.count(), null, "purple"),
                stat("活跃用户", userService.lambdaQuery().eq(User::getStatus, "ACTIVE").count(), trendForActiveUsers(), "cyan"),
                stat("已发布内容", cmsContentService.lambdaQuery().eq(CmsContent::getStatus, "PUBLISHED").count(), trendForPublishedContent(), "red")
        );
    }

    private Map<String, Object> stat(String label, long value, String trend, String tone) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("label", label);
        item.put("value", NumberFormat.getNumberInstance(Locale.CHINA).format(value));
        if (trend != null) {
            item.put("trend", trend);
        }
        item.put("tone", tone);
        return item;
    }

    private List<Map<String, Object>> activities() {
        List<Map<String, Object>> items = new ArrayList<>();
        auditLogService.lambdaQuery()
                .orderByDesc(AuditLog::getCreatedAt)
                .orderByDesc(AuditLog::getId)
                .last("limit 6")
                .list()
                .forEach(log -> items.add(activity(
                        "%s %s #%s".formatted(nullToText(log.getAction()), nullToText(log.getTargetType()), log.getTargetId()),
                        log.getCreatedAt(),
                        nullToText(log.getTargetType()))));

        courseService.lambdaQuery()
                .orderByDesc(Course::getCreatedAt)
                .orderByDesc(Course::getId)
                .last("limit 3")
                .list()
                .forEach(course -> items.add(activity(
                        "课程更新：" + nullToText(course.getCourseName()),
                        course.getCreatedAt(),
                        "课程")));

        cmsContentService.lambdaQuery()
                .orderByDesc(CmsContent::getCreatedAt)
                .orderByDesc(CmsContent::getId)
                .last("limit 3")
                .list()
                .forEach(content -> items.add(activity(
                        "内容更新：" + nullToText(content.getTitle()),
                        content.getCreatedAt(),
                        "内容")));

        return items.stream()
                .sorted((left, right) -> String.valueOf(right.get("occurredAt")).compareTo(String.valueOf(left.get("occurredAt"))))
                .limit(8)
                .toList();
    }

    private Map<String, Object> activity(String title, LocalDateTime occurredAt, String type) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", title);
        item.put("time", occurredAt == null ? "" : occurredAt.toLocalTime().withNano(0).toString());
        item.put("type", type);
        item.put("occurredAt", occurredAt);
        return item;
    }

    private List<Map<String, Object>> courseSamples() {
        return courseService.lambdaQuery()
                .orderByDesc(Course::getUpdatedAt)
                .orderByDesc(Course::getId)
                .page(new Page<>(1, 6))
                .getRecords()
                .stream()
                .map(this::courseSample)
                .toList();
    }

    private Map<String, Object> courseSample(Course course) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", course.getId());
        item.put("code", firstText(course.getCourseCode(), course.getExternalCourseId()));
        item.put("name", course.getCourseName());
        item.put("department", course.getDepartment());
        item.put("teacher", course.getTeacherName());
        item.put("credit", course.getCredit());
        item.put("status", course.getStatus());
        item.put("category", course.getCategory());
        item.put("permission", course.getPermission());
        item.put("featured", course.getFeatured());
        item.put("updatedAt", course.getUpdatedAt());
        return item;
    }

    private List<Map<String, Object>> chartSeries() {
        List<Map<String, Object>> series = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end = day.atTime(LocalTime.MAX);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("label", day.toString().substring(5));
            item.put("date", day.toString());
            item.put("courses", countCoursesBetween(start, end, false));
            item.put("articles", countArticlesBetween(start, end, false));
            item.put("users", countUsersBetween(start, end, false));
            series.add(item);
        }
        return series;
    }

    private String trendForCourses() {
        return trend(countCoursesBetween(daysAgo(7), LocalDateTime.now(), false),
                countCoursesBetween(daysAgo(14), daysAgo(7), false));
    }

    private String trendForActiveCourses() {
        return trend(countCoursesBetween(daysAgo(7), LocalDateTime.now(), true),
                countCoursesBetween(daysAgo(14), daysAgo(7), true));
    }

    private String trendForActiveUsers() {
        return trend(countUsersBetween(daysAgo(7), LocalDateTime.now(), true),
                countUsersBetween(daysAgo(14), daysAgo(7), true));
    }

    private String trendForPublishedContent() {
        return trend(countArticlesBetween(daysAgo(7), LocalDateTime.now(), true),
                countArticlesBetween(daysAgo(14), daysAgo(7), true));
    }

    private long countCoursesBetween(LocalDateTime start, LocalDateTime end, boolean activeOnly) {
        return courseService.lambdaQuery()
                .ge(Course::getCreatedAt, start)
                .lt(Course::getCreatedAt, end)
                .eq(activeOnly, Course::getStatus, "ACTIVE")
                .count();
    }

    private long countArticlesBetween(LocalDateTime start, LocalDateTime end, boolean publishedOnly) {
        return cmsContentService.lambdaQuery()
                .ge(CmsContent::getCreatedAt, start)
                .lt(CmsContent::getCreatedAt, end)
                .eq(publishedOnly, CmsContent::getStatus, "PUBLISHED")
                .count();
    }

    private long countUsersBetween(LocalDateTime start, LocalDateTime end, boolean activeOnly) {
        return userService.lambdaQuery()
                .ge(User::getCreatedAt, start)
                .lt(User::getCreatedAt, end)
                .eq(activeOnly, User::getStatus, "ACTIVE")
                .count();
    }

    private LocalDateTime daysAgo(long days) {
        return LocalDate.now().minusDays(days).atStartOfDay();
    }

    private String trend(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? "0%" : "+100%";
        }
        double percent = (current - previous) * 100.0 / previous;
        return "%+.1f%%".formatted(percent);
    }

    private String firstText(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }

    private String nullToText(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
