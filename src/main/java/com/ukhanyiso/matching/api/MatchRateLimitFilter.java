
package com.ukhanyiso.matching.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Clock;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Component
public final class MatchRateLimitFilter extends OncePerRequestFilter {

    static final int MAX_REQUESTS = 60;
    static final int MATCH_MAX_REQUESTS = 10;
    static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private static final String ERROR =
            "{\"errors\":[\"Too many attempts. Please wait a minute and try again.\"]}";

    private final Clock clock;
    private final Map<String, Window> clients = new HashMap<>();

    public MatchRateLimitFilter(Clock clock) {
        this.clock = clock;
    }

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

        String path = request.getRequestURI();
        String method = request.getMethod();

        int limit = "POST".equalsIgnoreCase(method) && "/api/match".equals(path)
                ? MATCH_MAX_REQUESTS
                : "POST".equalsIgnoreCase(method) && "/api/auth/signup".equals(path)
                ? 5
                : MAX_REQUESTS;

        String key = request.getRemoteAddr() + "|" + method + "|" + path;

        if (!allow(key, limit)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(ERROR);
            return;
        }

        chain.doFilter(request, response);
    }

    private synchronized boolean allow(String key, int limit) {
        long now = clock.millis();

        Iterator<Map.Entry<String, Window>> iterator =
                clients.entrySet().iterator();

        while (iterator.hasNext()) {
            Window window = iterator.next().getValue();

            if (now < window.startedAt
                    || now - window.startedAt >= WINDOW_MILLIS) {
                iterator.remove();
            }
        }

        Window window = clients.get(key);

        if (window == null) {
            if (clients.size() >= MAX_TRACKED_CLIENTS) {
                return false;
            }

            clients.put(key, new Window(now, 1));
            return true;
        }

        if (window.requests >= limit) {
            return false;
        }

        window.requests++;
        return true;
    }

    private static final class Window {
        private final long startedAt;
        private int requests;

        private Window(long startedAt, int requests) {
            this.startedAt = startedAt;
            this.requests = requests;
        }
    }
}