package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_quick_link")
public class PortalQuickLink extends BaseEntity {

    @TableId
    private Long id;

    private String title;
    private String iconUrl;
    private String linkUrl;
    private String linkType;
    private Integer sortOrder;
    private Boolean enabled;
}
