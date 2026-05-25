package com.edu.portal.portal.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.portal.entity.PortalTeacher;
import com.edu.portal.portal.mapper.PortalTeacherMapper;
import com.edu.portal.portal.service.PortalTeacherService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class PortalTeacherServiceImpl extends ServiceImpl<PortalTeacherMapper, PortalTeacher> implements PortalTeacherService {

    @Override
    public List<PortalTeacher> activeTeachers(String siteCode) {
        String resolvedSiteCode = StringUtils.hasText(siteCode) ? siteCode : "main";
        return lambdaQuery()
                .eq(PortalTeacher::getSiteCode, resolvedSiteCode)
                .eq(PortalTeacher::getEnabled, true)
                .orderByAsc(PortalTeacher::getSortOrder)
                .orderByDesc(PortalTeacher::getId)
                .list();
    }
}
