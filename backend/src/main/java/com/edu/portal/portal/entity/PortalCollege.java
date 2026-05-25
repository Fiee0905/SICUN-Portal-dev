package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_college")
public class PortalCollege extends BaseEntity {

    @TableId
    private Long id;

    private String siteCode;
    private String name;
    private String code;
    private String description;
    private Integer sortOrder;
    private Boolean enabled;
}
