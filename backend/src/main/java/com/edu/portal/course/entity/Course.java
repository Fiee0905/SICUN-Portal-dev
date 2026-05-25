package com.edu.portal.course.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("course_catalog")
public class Course extends BaseEntity {

    @TableId
    private Long id;

    private String externalCourseId;
    private Long termId;
    private String courseCode;
    private String courseName;
    private String teacherName;
    private String department;
    private String category;
    private BigDecimal credit;
    private String coverUrl;
    private String launchUrl;
    private String status;
    private String permission;
    private Boolean featured;
    private String description;
    private LocalDateTime lastSyncedAt;
}
