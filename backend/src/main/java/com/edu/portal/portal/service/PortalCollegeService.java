package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalCollege;

import java.util.List;

public interface PortalCollegeService extends IService<PortalCollege> {

    List<PortalCollege> activeColleges(String siteCode);
}
