package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalPageConfig;
import com.edu.portal.portal.mapper.PortalPageConfigMapper;
import com.edu.portal.portal.service.PortalPageConfigService;
import org.springframework.stereotype.Service;

@Service
public class PortalPageConfigServiceImpl extends ServiceImpl<PortalPageConfigMapper, PortalPageConfig> implements PortalPageConfigService {

    @Override
    public PortalPageConfig getEnabledPage(String siteCode, String pageCode) {
        return lambdaQuery()
                .eq(PortalPageConfig::getSiteCode, siteCode)
                .eq(PortalPageConfig::getPageCode, pageCode)
                .eq(PortalPageConfig::getEnabled, true)
                .one();
    }
}
