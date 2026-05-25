package com.edu.portal.cms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.cms.entity.CmsCategory;

import java.util.List;
import java.util.Map;

public interface CmsCategoryService extends IService<CmsCategory> {

    List<Map<String, Object>> tree(boolean publicOnly);

    CmsCategory getEnabledByCode(String code);
}
