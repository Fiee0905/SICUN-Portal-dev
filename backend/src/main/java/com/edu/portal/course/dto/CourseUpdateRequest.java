package com.edu.portal.course.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseUpdateRequest {

    private String courseName;

    private String description;

    private String coverUrl;

    private String category;

    private String teacherName;

    private String department;

    @DecimalMin("0.0")
    private BigDecimal credit;

    private String launchUrl;

    private String status;

    private String permission;

    private Boolean featured;
}
