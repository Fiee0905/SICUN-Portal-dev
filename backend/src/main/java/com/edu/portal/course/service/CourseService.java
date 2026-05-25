package com.edu.portal.course.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.course.dto.CourseCreateRequest;
import com.edu.portal.course.dto.CourseQuery;
import com.edu.portal.course.dto.CourseUpdateRequest;
import com.edu.portal.course.entity.Course;

public interface CourseService extends IService<Course> {

    IPage<Course> pageCourses(CourseQuery query);

    Course createCourse(CourseCreateRequest request);

    Course updateCourse(Long id, CourseUpdateRequest request);
}
