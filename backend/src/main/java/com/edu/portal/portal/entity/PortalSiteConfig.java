package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_site_config")
public class PortalSiteConfig extends BaseEntity {

    @TableId
    private Long id;

    private String siteCode;
    private String configKey;
    private String configValue;
    private String valueType;
    private String description;
}
