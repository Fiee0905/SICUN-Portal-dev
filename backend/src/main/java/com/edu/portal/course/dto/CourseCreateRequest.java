package com.edu.portal.course.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseCreateRequest {

    @NotBlank
    private String externalCourseId;

    @NotBlank
    private String courseName;

    private String courseCode;

    private String description;

    private String coverUrl;

    private String category;

    private String teacherName;

    private String department;

    @DecimalMin("0.0")
    private BigDecimal credit;

    private String launchUrl;

    private String status = "ACTIVE";

    private String permission = "public";

    private Boolean featured = false;
}
