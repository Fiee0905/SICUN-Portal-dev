package com.edu.portal.cms.dto;

import com.edu.portal.common.dto.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CmsContentQuery extends PageQuery {

    private String keyword;

    private Long categoryId;

    private String categoryCode;

    private String status;
}
