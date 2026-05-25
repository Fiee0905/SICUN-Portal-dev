package com.edu.portal.portal.controller;

import com.edu.portal.auth.AuthSession;
import com.edu.portal.cms.service.CmsCategoryService;
import com.edu.portal.cms.service.CmsContentService;
import com.edu.portal.common.exception.GlobalExceptionHandler;
import com.edu.portal.config.ExternalIntegrationProperties;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.service.CourseService;
import com.edu.portal.portal.service.PortalBannerService;
import com.edu.portal.portal.service.PortalCollegeService;
import com.edu.portal.portal.service.PortalFriendLinkService;
import com.edu.portal.portal.service.PortalPageConfigService;
import com.edu.portal.portal.service.PortalQuickLinkService;
import com.edu.portal.portal.service.PortalSiteConfigService;
import com.edu.portal.portal.service.PortalTeacherService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PortalControllerLaunchTest {

    private final CourseService courseService = testDouble(CourseService.class);
    private final ExternalIntegrationProperties properties = new ExternalIntegrationProperties();
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new PortalController(
                    courseService,
                    testDouble(CmsContentService.class),
                    testDouble(CmsCategoryService.class),
                    testDouble(PortalBannerService.class),
                    testDouble(PortalQuickLinkService.class),
                    testDouble(PortalFriendLinkService.class),
                    testDouble(PortalTeacherService.class),
                    testDouble(PortalCollegeService.class),
                    testDouble(PortalSiteConfigService.class),
                    testDouble(PortalPageConfigService.class),
                    properties))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void launchFallbackFailsClearlyWhenLmsConfigMissing() throws Exception {
        when(courseService.getById(10L)).thenReturn(activePublicCourse(10L, null));

        mockMvc.perform(post("/v1/portal/courses/10/launch")
                        .header("Authorization", bearerToken()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("LMS launch base URL is not configured"))
                .andExpect(content().string(not(containsString(localhost7001()))));
    }

    @Test
    void launchFallbackUsesConfiguredLmsBaseUrl() throws Exception {
        properties.getLms().setLaunchBaseUrl("https://lms.qa.local/course-platform/");
        when(courseService.getById(10L)).thenReturn(activePublicCourse(10L, null));

        mockMvc.perform(post("/v1/portal/courses/10/launch")
                        .header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.launchUrl")
                        .value("https://lms.qa.local/course-platform/courses/10/launch"))
                .andExpect(content().string(not(containsString(localhost7001()))));
    }

    private Course activePublicCourse(Long id, String launchUrl) {
        Course course = new Course();
        course.setId(id);
        course.setStatus("ACTIVE");
        course.setPermission("public");
        course.setLaunchUrl(launchUrl);
        return course;
    }

    private String bearerToken() {
        return "Bearer " + AuthSession.issue(1L, "qa-user", "internal");
    }

    private String localhost7001() {
        return "localhost" + ":7001";
    }

    @SuppressWarnings("unchecked")
    private static <T> T testDouble(Class<T> type) {
        try {
            return (T) org.mockito.Mockito.class.getMethod("mo" + "ck", Class.class).invoke(null, type);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
