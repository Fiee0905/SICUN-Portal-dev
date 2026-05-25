package com.edu.portal.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CmsContentCreateRequest {

    private Long categoryId;

    private String categoryCode;

    @NotBlank
    private String title;

    private String slug;

    private String summary;

    private String content;

    private String coverUrl;

    private String author;

    private String sourceName;

    private String tags;

    private Boolean featured = false;

    private Boolean pinned = false;

    private Boolean allowComment = false;

    private String status = "DRAFT";
}
