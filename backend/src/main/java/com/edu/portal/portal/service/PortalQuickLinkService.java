package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalQuickLink;

import java.util.List;

public interface PortalQuickLinkService extends IService<PortalQuickLink> {

    List<PortalQuickLink> activeLinks();

    List<PortalQuickLink> activeExternalLinks();
}
