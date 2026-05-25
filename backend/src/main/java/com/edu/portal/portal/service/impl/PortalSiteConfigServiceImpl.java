package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalSiteConfig;
import com.edu.portal.portal.mapper.PortalSiteConfigMapper;
import com.edu.portal.portal.service.PortalSiteConfigService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PortalSiteConfigServiceImpl extends ServiceImpl<PortalSiteConfigMapper, PortalSiteConfig> implements PortalSiteConfigService {

    @Override
    public Map<String, Object> configMap(String siteCode) {
        Map<String, Object> configs = new LinkedHashMap<>();
        lambdaQuery()
                .eq(PortalSiteConfig::getSiteCode, siteCode)
                .orderByAsc(PortalSiteConfig::getConfigKey)
                .list()
                .forEach(config -> configs.put(config.getConfigKey(), castValue(config)));
        return configs;
    }

    @Override
    public List<String> searchKeywords(String siteCode) {
        PortalSiteConfig config = lambdaQuery()
                .eq(PortalSiteConfig::getSiteCode, siteCode)
                .eq(PortalSiteConfig::getConfigKey, "course.search.keywords")
                .one();
        if (config == null || !StringUtils.hasText(config.getConfigValue())) {
            return List.of();
        }
        return Arrays.stream(config.getConfigValue().split("[,，\\n]"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .distinct()
                .limit(12)
                .toList();
    }

    private Object castValue(PortalSiteConfig config) {
        if ("NUMBER".equalsIgnoreCase(config.getValueType())) {
            try {
                return Long.parseLong(config.getConfigValue());
            } catch (NumberFormatException ignored) {
                return config.getConfigValue();
            }
        }
        if ("BOOLEAN".equalsIgnoreCase(config.getValueType())) {
            return Boolean.parseBoolean(config.getConfigValue());
        }
        return config.getConfigValue();
    }
}
