package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_teacher")
public class PortalTeacher extends BaseEntity {

    @TableId
    private Long id;

    private String siteCode;
    private String name;
    private String title;
    private String college;
    private String achievement;
    private String research;
    private Integer courseCount;
    private String avatarUrl;
    private Integer sortOrder;
    private Boolean enabled;
}
