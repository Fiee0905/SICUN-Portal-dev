package com.edu.portal.integration.controller;

import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.course.dto.CourseCreateRequest;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/integration")
public class CourseIntegrationController {

    private final CourseService courseService;

    @PostMapping("/courses/sync")
    public ApiResponse<Map<String, Object>> syncCourses(@Valid @RequestBody CourseSyncRequest request) {
        int success = 0;
        for (CourseCreateRequest item : request.courses()) {
            Course saved = courseService.createCourse(item);
            if (saved.getId() != null) {
                success++;
            }
        }
        return ApiResponse.ok(Map.of(
                "mode", request.mode(),
                "total", request.courses().size(),
                "success", success,
                "failure", request.courses().size() - success
        ));
    }

    public record CourseSyncRequest(String mode, List<CourseCreateRequest> courses) {
    }
}
