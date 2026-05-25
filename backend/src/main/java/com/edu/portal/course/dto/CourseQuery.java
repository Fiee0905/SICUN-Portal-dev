package com.edu.portal.course.dto;

import com.edu.portal.common.dto.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CourseQuery extends PageQuery {

    private String keyword;

    private String category;

    private String termCode;

    private String status;

    private List<String> permissions;

    private String department;

    private String college;

    private Boolean featured;

    private String sort;
}
