package com.edu.portal.cms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.cms.entity.CmsCategory;
import com.edu.portal.cms.mapper.CmsCategoryMapper;
import com.edu.portal.cms.service.CmsCategoryService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CmsCategoryServiceImpl extends ServiceImpl<CmsCategoryMapper, CmsCategory> implements CmsCategoryService {

    @Override
    public List<Map<String, Object>> tree(boolean publicOnly) {
        LambdaQueryWrapper<CmsCategory> wrapper = new LambdaQueryWrapper<CmsCategory>()
                .eq(publicOnly, CmsCategory::getVisible, true)
                .eq(publicOnly, CmsCategory::getEnabled, true)
                .orderByAsc(CmsCategory::getSortOrder)
                .orderByAsc(CmsCategory::getId);
        List<CmsCategory> categories = list(wrapper);
        Map<Long, Map<String, Object>> nodes = new LinkedHashMap<>();
        for (CmsCategory category : categories) {
            nodes.put(category.getId(), toNode(category));
        }
        List<Map<String, Object>> roots = new ArrayList<>();
        for (CmsCategory category : categories) {
            Map<String, Object> node = nodes.get(category.getId());
            if (category.getParentId() == null || !nodes.containsKey(category.getParentId())) {
                roots.add(node);
            } else {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> children = (List<Map<String, Object>>) nodes.get(category.getParentId()).get("children");
                children.add(node);
            }
        }
        sortTree(roots);
        return roots;
    }

    @Override
    public CmsCategory getEnabledByCode(String code) {
        return lambdaQuery()
                .eq(CmsCategory::getCode, code)
                .eq(CmsCategory::getEnabled, true)
                .one();
    }

    private Map<String, Object> toNode(CmsCategory category) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", category.getId());
        node.put("parentId", category.getParentId());
        node.put("code", category.getCode());
        node.put("name", category.getName());
        node.put("path", category.getPath());
        node.put("sortOrder", category.getSortOrder());
        node.put("visible", category.getVisible());
        node.put("enabled", category.getEnabled());
        node.put("children", new ArrayList<Map<String, Object>>());
        return node;
    }

    private void sortTree(List<Map<String, Object>> nodes) {
        nodes.sort(Comparator.comparing(node -> (Integer) node.getOrDefault("sortOrder", 0)));
        for (Map<String, Object> node : nodes) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) node.get("children");
            sortTree(children);
        }
    }
}
