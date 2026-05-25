package com.edu.portal.course.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.edu.portal.common.api.ApiResponse;
import com.edu.portal.course.dto.CourseCreateRequest;
import com.edu.portal.course.dto.CourseQuery;
import com.edu.portal.course.dto.CourseUpdateRequest;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.service.CourseService;
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
@RequestMapping("/v1/admin/courses")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ApiResponse<IPage<Course>> pageCourses(@Valid CourseQuery query) {
        return ApiResponse.ok(courseService.pageCourses(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<Course> getCourse(@PathVariable @Min(1) Long id) {
        return ApiResponse.ok(courseService.getById(id));
    }

    @PostMapping
    public ApiResponse<Course> createCourse(@Valid @RequestBody CourseCreateRequest request) {
        return ApiResponse.ok(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Course> updateCourse(@PathVariable @Min(1) Long id,
                                            @Valid @RequestBody CourseUpdateRequest request) {
        return ApiResponse.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable @Min(1) Long id) {
        courseService.removeById(id);
        return ApiResponse.ok();
    }
}
