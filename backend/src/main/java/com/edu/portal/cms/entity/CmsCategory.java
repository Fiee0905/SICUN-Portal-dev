package com.edu.portal.cms.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cms_category")
public class CmsCategory extends BaseEntity {

    @TableId
    private Long id;

    private Long parentId;
    private String code;
    private String name;
    private String path;
    private String siteCode;
    private Integer sortOrder;
    private Boolean visible;
    private Boolean enabled;
    private String template;
}
