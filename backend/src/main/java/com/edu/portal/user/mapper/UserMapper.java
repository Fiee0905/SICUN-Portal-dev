package com.edu.portal.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edu.portal.user.entity.User;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface UserMapper extends BaseMapper<User> {

    @Select("""
            select r.code
            from sys_role r
            join sys_user_role ur on ur.role_id = r.id
            where ur.user_id = #{userId}
              and r.enabled = 1
              and r.deleted = 0
            order by r.id
            """)
    List<String> selectRoleCodes(Long userId);

    @Select("""
            select distinct p.code
            from sys_permission p
            join sys_role_permission rp on rp.permission_id = p.id
            join sys_user_role ur on ur.role_id = rp.role_id
            join sys_role r on r.id = ur.role_id
            where ur.user_id = #{userId}
              and p.deleted = 0
              and r.enabled = 1
              and r.deleted = 0
            order by p.code
            """)
    List<String> selectPermissionCodes(Long userId);
}
