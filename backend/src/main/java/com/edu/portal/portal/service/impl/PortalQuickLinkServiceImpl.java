package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalQuickLink;
import com.edu.portal.portal.mapper.PortalQuickLinkMapper;
import com.edu.portal.portal.service.PortalQuickLinkService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortalQuickLinkServiceImpl extends ServiceImpl<PortalQuickLinkMapper, PortalQuickLink> implements PortalQuickLinkService {

    @Override
    public List<PortalQuickLink> activeLinks() {
        return lambdaQuery()
                .eq(PortalQuickLink::getEnabled, true)
                .orderByAsc(PortalQuickLink::getSortOrder)
                .orderByDesc(PortalQuickLink::getId)
                .list();
    }

    @Override
    public List<PortalQuickLink> activeExternalLinks() {
        return lambdaQuery()
                .eq(PortalQuickLink::getEnabled, true)
                .eq(PortalQuickLink::getLinkType, "EXTERNAL")
                .orderByAsc(PortalQuickLink::getSortOrder)
                .orderByDesc(PortalQuickLink::getId)
                .list();
    }
}
