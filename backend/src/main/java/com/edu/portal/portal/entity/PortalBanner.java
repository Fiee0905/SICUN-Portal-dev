package com.edu.portal.portal.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("portal_banner")
public class PortalBanner extends BaseEntity {

    @TableId
    private Long id;

    private String title;
    private String imageUrl;
    private String linkUrl;
    private String position;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
