package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalPageConfig;

public interface PortalPageConfigService extends IService<PortalPageConfig> {

    PortalPageConfig getEnabledPage(String siteCode, String pageCode);
}
