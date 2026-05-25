package com.edu.portal.cms.dto;

import lombok.Data;

@Data
public class CmsContentUpdateRequest {

    private Long categoryId;

    private String categoryCode;

    private String title;

    private String summary;

    private String content;

    private String coverUrl;

    private String author;

    private String sourceName;

    private String tags;

    private Boolean featured;

    private Boolean pinned;

    private Boolean allowComment;

    private String status;
}
