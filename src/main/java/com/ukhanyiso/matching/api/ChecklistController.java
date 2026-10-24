
package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;
import java.util.Set;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChecklistController {
    private static final String USER = "checklist.user";
    private static final String CSRF = "checklist.csrf";
    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,200}\\.[A-Za-z]{2,24}$");
    private static final Set<String> LANGS = Set.of("en", "zu", "xh", "st", "af");

    private static final List<ChecklistItem> ITEMS = List.of(
            new ChecklistItem("id-document", "Certified ID or birth certificate", "identity"),
            new ChecklistItem("school-results", "Latest school results", "academic"),
            new ChecklistItem("proof-of-residence", "Proof of home address", "residence"),
            new ChecklistItem("parent-id", "Certified copy of parent/guardian ID", "family"),
            new ChecklistItem("parent-income", "Proof of household income (pay slip, pension slip, or affidavit)", "financial")
    );

    private final ChecklistRepository repository;

    public ChecklistController(ChecklistRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest request,
                               HttpServletRequest httpRequest) {
        if (request == null || request.email() == null || request.password() == null
                || request.email().length() > 100 || request.password().length() > 200) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (!repository.passwordMatches(email, request.password())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        HttpSession old = httpRequest.getSession(false);
        if (old != null) {
            old.invalidate();
        }

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(USER, email);

        return new LoginResponse(repository.displayName(email), csrf(session));
    }

    @PostMapping("/auth/signup")
    public LoginResponse signup(@RequestBody SignupRequest r,
                                HttpServletRequest httpRequest) {
        if (r == null || r.email() == null || r.password() == null
                || r.language() == null || !r.consent()
                || r.email().length() > 100
                || r.password().length() < 10 || r.password().length() > 200
                || !LANGS.contains(r.language())
                || !EMAIL.matcher(r.email().trim()).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please check your details and try again.");
        }

        String email = r.email().trim().toLowerCase(Locale.ROOT);

        if (!repository.createUser(email, r.password(), r.language())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "We could not create that account. If you already have one, please log in.");
        }

        HttpSession old = httpRequest.getSession(false);
        if (old != null) {
            old.invalidate();
        }

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(USER, email);

        return new LoginResponse(repository.displayName(email), csrf(session));
    }

    @GetMapping("/plan")
    public PlanResponse plan(HttpSession session) {
        String user = requireUser(session);
        return new PlanResponse(repository.plan(user), csrf(session));
    }

    @PutMapping("/plan")
    public PlanResponse savePlan(
            @RequestBody PlanData plan,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = requireUser(session);

        if (token == null || !csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }

        if (plan == null || !plan.valid()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please check the numbers.");
        }

        repository.savePlan(user, plan);
        return new PlanResponse(repository.plan(user), csrf(session));
    }

    @GetMapping("/checklist")
    public ChecklistResponse checklist(HttpSession session) {
        String user = requireUser(session);
        return new ChecklistResponse(
                ITEMS, repository.progress(user), csrf(session));
    }

    // Supports the PUT /api/checklist request used by ChecklistApiTest.
    @PutMapping("/checklist")
    public ChecklistResponse updateChecklist(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = requireUser(session);

        if (token == null || !csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }

        Object itemIdValue = body == null ? null : body.get("itemId");
        Object completedValue = body == null ? null : body.get("completed");

        if (!(itemIdValue instanceof String itemId)
                || ITEMS.stream().noneMatch(item -> item.id().equals(itemId))
                || !(completedValue instanceof Boolean completed)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid checklist item.");
        }

        repository.saveProgress(user, itemId, completed);

        return new ChecklistResponse(
                ITEMS, repository.progress(user), csrf(session));
    }

    @RequestMapping(
            value = "/checklist/{itemId}",
            method = {RequestMethod.PUT, RequestMethod.POST})
    public ChecklistResponse setItem(
            @PathVariable String itemId,
            @RequestBody(required = false) Map<String, Boolean> body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = requireUser(session);

        if (token == null || !csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }

        boolean validItem = ITEMS.stream()
                .anyMatch(item -> item.id().equals(itemId));

        if (!validItem) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid checklist item.");
        }

        boolean completed = body != null
                && Boolean.TRUE.equals(body.get("completed"));

        repository.saveProgress(user, itemId, completed);

        return new ChecklistResponse(
                ITEMS, repository.progress(user), csrf(session));
    }

    private String requireUser(HttpSession session) {
        String user = (String) session.getAttribute(USER);

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required.");
        }

        return user;
    }

    private String csrf(HttpSession session) {
        String token = (String) session.getAttribute(CSRF);

        if (token == null) {
            token = UUID.randomUUID().toString();
            session.setAttribute(CSRF, token);
        }

        return token;
    }

    public record LoginRequest(String email, String password) { }

    public record ChecklistItem(String id, String label, String category) { }

    public record ChecklistResponse(
            List<ChecklistItem> items,
            Map<String, Boolean> progress,
            String csrfToken) { }

    public record LoginResponse(String displayName, String csrfToken) { }

    public record SignupRequest(
            String email, String password, String language, boolean consent) { }

    public record PlanResponse(PlanData plan, String csrfToken) { }

    public record PlanData(
            int funding,
            int months,
            int required,
            int current,
            int worth,
            int startup,
            int weeks,
            int home,
            int food,
            int travel,
            int data,
            int other) {

        boolean valid() {
            int[] money = {
                    funding, worth, startup, home, food,
                    travel, data, other
            };

            for (int m : money) {
                if (m < 0 || m > 1_000_000) {
                    return false;
                }
            }

            return months >= 1 && months <= 12
                    && required >= 0 && required <= 100
                    && current >= 0 && current <= 100
                    && weeks >= 0 && weeks <= 52;
        }
    }
}