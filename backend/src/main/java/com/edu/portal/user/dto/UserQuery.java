package com.edu.portal.user.dto;

import com.edu.portal.common.dto.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserQuery extends PageQuery {

    private String keyword;

    private String userType;

    private String role;

    private String source;

    private String status;
}
