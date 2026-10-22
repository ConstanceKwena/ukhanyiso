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

/** Limits POST /api/match to ten requests per client in a 60-second window. */
@Component
public final class MatchRateLimitFilter extends OncePerRequestFilter {

    static final int MAX_REQUESTS = 10;
    static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_TRACKED_CLIENTS = 10_000;
    private static final String TOO_MANY_REQUESTS =
            "{\"errors\":[\"Too many attempts. Please wait a minute and try again.\"]}";

    private final Clock clock;
    private final Map<String, Window> clients = new HashMap<>();

    public MatchRateLimitFilter(Clock clock) {
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod())
                || !"/api/match".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        if (!allow(request.getRemoteAddr())) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(TOO_MANY_REQUESTS);
            return;
        }
        chain.doFilter(request, response);
    }

    private synchronized boolean allow(String clientAddress) {
        long now = clock.millis();
        Iterator<Map.Entry<String, Window>> iterator = clients.entrySet().iterator();
        while (iterator.hasNext()) {
            Window window = iterator.next().getValue();
            if (now < window.startedAt || now - window.startedAt >= WINDOW_MILLIS) {
                iterator.remove();
            }
        }

        Window window = clients.get(clientAddress);
        if (window == null) {
            if (clients.size() >= MAX_TRACKED_CLIENTS) {
                return false;
            }
            clients.put(clientAddress, new Window(now, 1));
            return true;
        }
        if (window.requests >= MAX_REQUESTS) {
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
