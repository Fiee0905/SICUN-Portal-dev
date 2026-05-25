package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalFriendLink;
import com.edu.portal.portal.mapper.PortalFriendLinkMapper;
import com.edu.portal.portal.service.PortalFriendLinkService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class PortalFriendLinkServiceImpl extends ServiceImpl<PortalFriendLinkMapper, PortalFriendLink> implements PortalFriendLinkService {

    @Override
    public List<PortalFriendLink> activeLinks(String siteCode) {
        String resolvedSiteCode = StringUtils.hasText(siteCode) ? siteCode : "main";
        return lambdaQuery()
                .eq(PortalFriendLink::getSiteCode, resolvedSiteCode)
                .eq(PortalFriendLink::getEnabled, true)
                .orderByAsc(PortalFriendLink::getSortOrder)
                .orderByDesc(PortalFriendLink::getId)
                .list();
    }
}
