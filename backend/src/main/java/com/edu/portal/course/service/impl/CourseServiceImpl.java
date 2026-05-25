package com.edu.portal.course.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.common.exception.BusinessException;
import com.edu.portal.course.dto.CourseCreateRequest;
import com.edu.portal.course.dto.CourseQuery;
import com.edu.portal.course.dto.CourseUpdateRequest;
import com.edu.portal.course.entity.Course;
import com.edu.portal.course.mapper.CourseMapper;
import com.edu.portal.course.service.CourseService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course> implements CourseService {

    @Override
    public IPage<Course> pageCourses(CourseQuery query) {
        String termCode = query.getTermCode();
        String department = StringUtils.hasText(query.getDepartment()) ? query.getDepartment() : query.getCollege();
        String termSql = StringUtils.hasText(termCode)
                ? "select id from course_term where term_code = '" + termCode.replace("'", "''") + "' and deleted = 0"
                : null;
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<Course>()
                .eq(StringUtils.hasText(query.getStatus()), Course::getStatus, query.getStatus())
                .in(query.getPermissions() != null && !query.getPermissions().isEmpty(), Course::getPermission, query.getPermissions())
                .eq(StringUtils.hasText(query.getCategory()), Course::getCategory, query.getCategory())
                .eq(StringUtils.hasText(department), Course::getDepartment, department)
                .eq(query.getFeatured() != null, Course::getFeatured, query.getFeatured())
                .inSql(StringUtils.hasText(termCode), Course::getTermId, termSql)
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(Course::getCourseName, query.getKeyword())
                        .or()
                        .like(Course::getCourseCode, query.getKeyword())
                        .or()
                        .like(Course::getTeacherName, query.getKeyword()));
        if ("latest".equalsIgnoreCase(query.getSort())) {
            wrapper.orderByDesc(Course::getCreatedAt).orderByDesc(Course::getId);
        } else {
            wrapper.orderByDesc(Course::getId);
        }
        return page(new Page<>(query.getPage(), query.getSize()), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Course createCourse(CourseCreateRequest request) {
        boolean duplicated = lambdaQuery().eq(Course::getExternalCourseId, request.getExternalCourseId()).exists();
        if (duplicated) {
            throw new BusinessException("Course code already exists");
        }

        Course course = new Course();
        BeanUtils.copyProperties(request, course);
        course.setPermission(normalizePermission(request.getPermission()));
        course.setLastSyncedAt(LocalDateTime.now());
        save(course);
        return course;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Course updateCourse(Long id, CourseUpdateRequest request) {
        Course course = getById(id);
        if (course == null) {
            throw new BusinessException(404, "Course not found");
        }

        BeanUtils.copyProperties(request, course);
        if (StringUtils.hasText(request.getPermission())) {
            course.setPermission(normalizePermission(request.getPermission()));
        }
        course.setLastSyncedAt(LocalDateTime.now());
        updateById(course);
        return course;
    }

    private String normalizePermission(String permission) {
        if (!StringUtils.hasText(permission)) {
            return "public";
        }
        String value = permission.trim().toLowerCase();
        if (!List.of("public", "internal", "private").contains(value)) {
            throw new BusinessException("Unsupported course permission");
        }
        return value;
    }
}
