package com.edu.portal.cms.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.cms.dto.CmsContentCreateRequest;
import com.edu.portal.cms.dto.CmsContentQuery;
import com.edu.portal.cms.dto.CmsContentUpdateRequest;
import com.edu.portal.cms.entity.CmsContent;

public interface CmsContentService extends IService<CmsContent> {

    IPage<CmsContent> pageContents(CmsContentQuery query);

    CmsContent createContent(CmsContentCreateRequest request);

    CmsContent updateContent(Long id, CmsContentUpdateRequest request);

    CmsContent changeStatus(Long id, String targetStatus);
}
