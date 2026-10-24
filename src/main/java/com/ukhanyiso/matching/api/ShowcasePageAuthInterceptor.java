package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class ShowcasePageAuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {
        if (ShowcaseSession.hasUser(request.getSession(false))) return true;
        response.sendRedirect("/login.html");
        return false;
    }
}
