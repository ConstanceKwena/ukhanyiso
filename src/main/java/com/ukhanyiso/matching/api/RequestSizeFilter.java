
package com.ukhanyiso.matching.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestSizeFilter extends OncePerRequestFilter {

    static final long MAX_API_BYTES = 16_384;
    static final long MAX_MATCH_BYTES = 4_096;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        long limit = "/api/match".equals(request.getRequestURI())
                ? MAX_MATCH_BYTES
                : MAX_API_BYTES;

        if (request.getContentLengthLong() > limit) {
            response.setStatus(413);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    "{\"errors\":[\"That request is too large.\"]}"
            );
            return;
        }

        chain.doFilter(request, response);
    }
}