package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

public final class ShowcaseSession {
    public static final String USER_ATTRIBUTE = "checklist.user";
    static final String CSRF_ATTRIBUTE = "checklist.csrf";

    private ShowcaseSession() { }

    public static String requireUser(HttpSession session) {
        String user = user(session);
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return user;
    }

    public static boolean hasUser(HttpSession session) {
        return user(session) != null;
    }

    /** Checks the request CSRF token the same way the controllers do. */
    public static void requireCsrf(HttpSession session, String token) {
        if (session == null || token == null || !ShowcaseSession.csrf(session).equals(token)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }
    }

    static String csrf(HttpSession session) {
        String token = (String) session.getAttribute(CSRF_ATTRIBUTE);
        if (token == null) {
            token = UUID.randomUUID().toString();
            session.setAttribute(CSRF_ATTRIBUTE, token);
        }
        return token;
    }

    private static String user(HttpSession session) {
        return session == null ? null : (String) session.getAttribute(USER_ATTRIBUTE);
    }
}
