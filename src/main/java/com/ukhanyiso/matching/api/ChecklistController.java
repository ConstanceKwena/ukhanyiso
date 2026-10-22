package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChecklistController {
    private static final String USER = "checklist.user";
    private static final String CSRF = "checklist.csrf";
    private static final List<ChecklistItem> ITEMS = List.of(
            new ChecklistItem("id-document", "Certified ID or birth certificate", "identity"),
            new ChecklistItem("school-results", "Latest school results", "academic"),
            new ChecklistItem("proof-of-income", "Proof of household income", "funding"),
            new ChecklistItem("apply", "Submit the bursary or course application", "application"));

    private final ChecklistRepository repository;

    public ChecklistController(ChecklistRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (request == null || request.email() == null || request.password() == null
                || request.email().length() > 100 || request.password().length() > 200
                || !repository.passwordMatches(request.email(), request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        HttpSession old = httpRequest.getSession(false);
        if (old != null) old.invalidate();
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(USER, request.email());
        return new LoginResponse(DemoAccount.DISPLAY_NAME, csrf(session));
    }

    @GetMapping("/checklist")
    public ChecklistResponse checklist(HttpSession session) {
        String user = requireUser(session);
        return new ChecklistResponse(ITEMS, repository.progress(user), csrf(session));
    }

    @PutMapping("/checklist")
    public ChecklistResponse update(@RequestBody ChecklistUpdate request, @RequestHeader("X-CSRF-Token") String token,
                                    HttpSession session) {
        String user = requireUser(session);
        if (!csrf(session).equals(token)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        if (ITEMS.stream().noneMatch(item -> item.id().equals(request.itemId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown checklist item.");
        }
        repository.save(user, request.itemId(), request.completed());
        return new ChecklistResponse(ITEMS, repository.progress(user), csrf(session));
    }

    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader("X-CSRF-Token") String token, HttpSession session) {
        requireUser(session);
        if (!csrf(session).equals(token)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        session.invalidate();
    }

    private String requireUser(HttpSession session) {
        Object user = session.getAttribute(USER);
        if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in first.");
        return user.toString();
    }

    private String csrf(HttpSession session) {
        Object existing = session.getAttribute(CSRF);
        if (existing != null) return existing.toString();
        String token = UUID.randomUUID().toString();
        session.setAttribute(CSRF, token);
        return token;
    }

    public record LoginRequest(String email, String password) { }
    public record ChecklistUpdate(String itemId, boolean completed) { }
    public record ChecklistItem(String id, String label, String category) { }
    public record ChecklistResponse(List<ChecklistItem> items, Map<String, Boolean> progress, String csrfToken) { }
    public record LoginResponse(String displayName, String csrfToken) { }
}
