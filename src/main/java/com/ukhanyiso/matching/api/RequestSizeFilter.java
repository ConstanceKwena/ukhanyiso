package com.ukhanyiso.matching.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Rejects oversized bodies on /api/match before they are read (test case S-03). A real marks request is under 1 KB.
 * Limit: a request sent without a Content-Length header is not caught here; MarksValidator still caps it at 12 subjects.
 */
@Component
public class RequestSizeFilter extends OncePerRequestFilter {

    static final long MAX_BYTES = 4096;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/match") && request.getContentLengthLong() > MAX_BYTES) {
            response.setStatus(413);
            response.setContentType("application/json");
            response.getWriter().write("{\"errors\":[\"That request is too large.\"]}");
            return;
        }
        chain.doFilter(request, response);
    }
}
