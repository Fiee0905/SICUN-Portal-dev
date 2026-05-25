package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalBanner;

import java.util.List;

public interface PortalBannerService extends IService<PortalBanner> {

    List<PortalBanner> activeBanners(String position);
}
