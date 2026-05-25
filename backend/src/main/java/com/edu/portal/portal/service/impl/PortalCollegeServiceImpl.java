package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalCollege;
import com.edu.portal.portal.mapper.PortalCollegeMapper;
import com.edu.portal.portal.service.PortalCollegeService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class PortalCollegeServiceImpl extends ServiceImpl<PortalCollegeMapper, PortalCollege> implements PortalCollegeService {

    @Override
    public List<PortalCollege> activeColleges(String siteCode) {
        String resolvedSiteCode = StringUtils.hasText(siteCode) ? siteCode : "main";
        return lambdaQuery()
                .eq(PortalCollege::getSiteCode, resolvedSiteCode)
                .eq(PortalCollege::getEnabled, true)
                .orderByAsc(PortalCollege::getSortOrder)
                .orderByDesc(PortalCollege::getId)
                .list();
    }
}
