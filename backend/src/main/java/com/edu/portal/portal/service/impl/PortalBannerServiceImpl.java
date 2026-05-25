package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalBanner;
import com.edu.portal.portal.mapper.PortalBannerMapper;
import com.edu.portal.portal.service.PortalBannerService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PortalBannerServiceImpl extends ServiceImpl<PortalBannerMapper, PortalBanner> implements PortalBannerService {

    @Override
    public List<PortalBanner> activeBanners(String position) {
        LocalDateTime now = LocalDateTime.now();
        String normalizedPosition = normalizePosition(position);
        return lambdaQuery()
                .eq(PortalBanner::getEnabled, true)
                .eq(StringUtils.hasText(normalizedPosition), PortalBanner::getPosition, normalizedPosition)
                .and(w -> w.isNull(PortalBanner::getStartAt).or().le(PortalBanner::getStartAt, now))
                .and(w -> w.isNull(PortalBanner::getEndAt).or().ge(PortalBanner::getEndAt, now))
                .orderByAsc(PortalBanner::getSortOrder)
                .orderByDesc(PortalBanner::getId)
                .list();
    }

    private String normalizePosition(String position) {
        if (!StringUtils.hasText(position)) {
            return position;
        }
        String value = position.trim();
        if ("home".equalsIgnoreCase(value)) {
            return "HOME_TOP";
        }
        return value.toUpperCase();
    }
}
