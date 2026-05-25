package com.edu.portal.config;

import com.edu.portal.auth.AuthSession;
import com.edu.portal.common.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        AuthSession session = AuthSession.fromRequest(request)
                .orElseThrow(() -> new BusinessException(401, "AUTH_REQUIRED"));
        if (!"admin".equals(session.role())) {
            throw new BusinessException(403, "FORBIDDEN_ADMIN");
        }
        return true;
    }
}
