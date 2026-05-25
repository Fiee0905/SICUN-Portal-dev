package com.edu.portal.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.edu.portal.common.exception.BusinessException;
import com.edu.portal.user.dto.UserCreateRequest;
import com.edu.portal.user.dto.UserQuery;
import com.edu.portal.user.dto.UserUpdateRequest;
import com.edu.portal.user.entity.User;
import com.edu.portal.user.mapper.UserMapper;
import com.edu.portal.user.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public IPage<User> pageUsers(UserQuery query) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .eq(StringUtils.hasText(query.getStatus()), User::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getUserType()), User::getUserType, query.getUserType())
                .eq(StringUtils.hasText(query.getRole()), User::getRole, query.getRole())
                .eq(StringUtils.hasText(query.getSource()), User::getSource, query.getSource())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(User::getUsername, query.getKeyword())
                        .or()
                        .like(User::getDisplayName, query.getKeyword())
                        .or()
                        .like(User::getEmail, query.getKeyword()))
                .orderByDesc(User::getId);
        return page(new Page<>(query.getPage(), query.getSize()), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User createUser(UserCreateRequest request) {
        boolean duplicated = lambdaQuery().eq(User::getUsername, request.getUsername()).exists();
        if (duplicated) {
            throw new BusinessException("Username already exists");
        }

        User user = new User();
        BeanUtils.copyProperties(request, user);
        user.setRole(normalizeRole(request.getRole()));
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(hashPassword(request.getPassword()));
        }
        save(user);
        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User updateStatus(Long id, String status) {
        User user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        String normalizedStatus = normalizeStatus(status);
        user.setStatus(normalizedStatus);
        updateById(user);
        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User registerExternal(UserCreateRequest request) {
        request.setRole("external");
        request.setUserType("GUEST");
        request.setSource("LOCAL");
        request.setStatus("ACTIVE");
        return createUser(request);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User authenticate(String username, String password) {
        User user = lambdaQuery()
                .eq(User::getUsername, username)
                .one();
        if (user == null || !matches(password, user.getPasswordHash())) {
            throw new BusinessException(401, "Invalid username or password");
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BusinessException(403, "User is not active");
        }
        user.setLastLoginAt(LocalDateTime.now());
        updateById(user);
        return user;
    }

    @Override
    public User activeUser(Long id) {
        User user = getById(id);
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            throw new BusinessException(401, "AUTH_REQUIRED");
        }
        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User updateUser(Long id, UserUpdateRequest request) {
        User user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        BeanUtils.copyProperties(request, user);
        if (StringUtils.hasText(request.getRole())) {
            user.setRole(normalizeRole(request.getRole()));
        }
        updateById(user);
        return user;
    }

    @Override
    public List<String> roleCodes(Long userId) {
        return baseMapper.selectRoleCodes(userId);
    }

    @Override
    public List<String> permissionCodes(Long userId) {
        return baseMapper.selectPermissionCodes(userId);
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            return "external";
        }
        String value = role.trim().toLowerCase();
        if (!List.of("admin", "internal", "external").contains(value)) {
            throw new BusinessException("Unsupported user role");
        }
        return value;
    }

    private String normalizeStatus(String status) {
        if (!StringUtils.hasText(status)) {
            throw new BusinessException("User status is required");
        }
        String value = status.trim().toUpperCase();
        if (!List.of("ACTIVE", "PENDING_REVIEW", "REJECTED", "DISABLED").contains(value)) {
            throw new BusinessException("Unsupported user status");
        }
        return value;
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return "{sha256}" + HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private boolean matches(String password, String passwordHash) {
        if (!StringUtils.hasText(passwordHash)) {
            return false;
        }
        if (passwordHash.startsWith("{noop}")) {
            return passwordHash.substring("{noop}".length()).equals(password);
        }
        if (passwordHash.startsWith("{sha256}")) {
            return hashPassword(password).equals(passwordHash);
        }
        return passwordHash.equals(password);
    }
}
