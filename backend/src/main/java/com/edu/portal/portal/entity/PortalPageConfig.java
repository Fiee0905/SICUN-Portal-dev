package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_page_config")
public class PortalPageConfig extends BaseEntity {

    @TableId
    private Long id;

    private String siteCode;
    private String pageCode;
    private String pageTitle;
    private String layoutJson;
    private String seoJson;
    private Boolean enabled;
}
