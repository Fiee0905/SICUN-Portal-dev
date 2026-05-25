package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalSiteConfig;

import java.util.List;
import java.util.Map;

public interface PortalSiteConfigService extends IService<PortalSiteConfig> {

    Map<String, Object> configMap(String siteCode);

    List<String> searchKeywords(String siteCode);
}
