package com.edu.portal.cms.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.edu.portal.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cms_article")
public class CmsContent extends BaseEntity {

    @TableId
    private Long id;

    private Long categoryId;
    @TableField(exist = false)
    private String categoryCode;
    @TableField(exist = false)
    private String categoryName;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverUrl;
    private String author;
    private String sourceName;
    private String tags;
    private String status;
    private Boolean featured;
    private Boolean pinned;
    private Boolean allowComment;
    private Long viewCount;
    private LocalDateTime publishedAt;
    private LocalDateTime offlineAt;
}
