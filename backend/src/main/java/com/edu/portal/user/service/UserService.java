package com.edu.portal.user.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.edu.portal.user.dto.UserCreateRequest;
import com.edu.portal.user.dto.UserQuery;
import com.edu.portal.user.dto.UserUpdateRequest;
import com.edu.portal.user.entity.User;

import java.util.List;

public interface UserService extends IService<User> {

    IPage<User> pageUsers(UserQuery query);

    User createUser(UserCreateRequest request);

    User registerExternal(UserCreateRequest request);

    User authenticate(String username, String password);

    User activeUser(Long id);

    User updateUser(Long id, UserUpdateRequest request);

    User updateStatus(Long id, String status);

    List<String> roleCodes(Long userId);

    List<String> permissionCodes(Long userId);
}
