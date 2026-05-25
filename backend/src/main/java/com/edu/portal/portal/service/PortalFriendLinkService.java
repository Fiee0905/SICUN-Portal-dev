package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalFriendLink;

import java.util.List;

public interface PortalFriendLinkService extends IService<PortalFriendLink> {

    List<PortalFriendLink> activeLinks(String siteCode);
}
