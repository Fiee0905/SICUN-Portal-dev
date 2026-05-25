package com.edu.portal.portal.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.portal.entity.PortalTeacher;

import java.util.List;

public interface PortalTeacherService extends IService<PortalTeacher> {

    List<PortalTeacher> activeTeachers(String siteCode);
}
