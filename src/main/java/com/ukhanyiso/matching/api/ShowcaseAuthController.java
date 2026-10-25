package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class ShowcaseAuthController {
    private static final Logger log = LoggerFactory.getLogger(ShowcaseAuthController.class);
    private static final Pattern USERNAME = Pattern.compile("[a-zA-Z0-9_-]{3,50}");
    private static final Pattern EMAIL = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern NAME = Pattern.compile("[\\p{L}][\\p{L}\\s'’-]{0,79}");
    public static final int MIN_PASSWORD_LENGTH = 12;
    public static final int MAX_PASSWORD_LENGTH = 128;
    private static final PasswordHasher.Credentials DUMMY_CREDENTIALS =
            new PasswordHasher.Credentials(
                    "AAAAAAAAAAAAAAAAAAAAAA==",
                    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    private final ChecklistRepository repository;
    private final PasswordRecoveryService recovery;
    private final PasswordHasher passwordHasher = new PasswordHasher();

    public ShowcaseAuthController(ChecklistRepository repository, PasswordRecoveryService recovery) {
        this.repository = repository;
        this.recovery = recovery;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(HttpServletRequest request) {
        return new CsrfResponse(ShowcaseSession.csrf(request.getSession(true)));
    }

    @PostMapping("/signup")
    public AuthResponse signup(
            @RequestBody(required = false) CredentialsRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpServletRequest request) {
        verifyCsrf(request.getSession(false), token);
        if (body == null || !validUsername(body.username())
                || !validPassword(body.password())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use a valid username and a password of 12 to 128 characters.");
        }

        String username = normalizeUsername(body.username());
        char[] password = body.password().toCharArray();
        PasswordHasher.Credentials credentials;
        try {
            credentials = passwordHasher.hash(password);
        } finally {
            java.util.Arrays.fill(password, '\0');
        }
        try {
            repository.createAccount(username, credentials.salt(), credentials.hash());
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "That username is already in use.");
        }

        return startSession(username, request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody(required = false) CredentialsRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpServletRequest request) {
        verifyCsrf(request.getSession(false), token);
        if (body == null || !validUsername(body.username())
                || !validPassword(body.password())) {
            throw invalidCredentials();
        }

        String username = normalizeUsername(body.username());
        PasswordHasher.Credentials credentials = repository.credentials(username);
        char[] password = body.password().toCharArray();
        boolean matches;
        try {
            PasswordHasher.Credentials toCheck =
                    credentials == null ? DUMMY_CREDENTIALS : credentials;
            matches = passwordHasher.matches(password, toCheck) && credentials != null;
        } finally {
            java.util.Arrays.fill(password, '\0');
        }
        if (!matches) throw invalidCredentials();

        return startSession(username, request);
    }

    @GetMapping("/me")
    public AuthResponse currentUser(HttpSession session) {
        String username = ShowcaseSession.requireUser(session);
        return new AuthResponse(username, ShowcaseSession.csrf(session));
    }

    @PostMapping("/logout")
    public void logout(
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        ShowcaseSession.requireUser(session);
        verifyCsrf(session, token);
        session.invalidate();
    }

    /** Signed-in learner stores/updates the recovery email (hashed at rest). */
    @PutMapping("/recovery-email")
    public void setRecoveryEmail(
            @RequestBody(required = false) RecoveryEmailRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        verifyCsrf(session, token);
        if (body == null || body.email() == null || body.email().length() > 200
                || !EMAIL.matcher(body.email()).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Provide a valid email address.");
        }
        recovery.setRecoveryEmail(user, body.email());
    }

    @GetMapping("/profile")
    public ProfileResponse profile(HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        ChecklistRepository.Profile p = repository.profile(user);
        return new ProfileResponse(p.firstName(), p.surname(), p.contactEmail(), p.whatsapp());
    }

    /** All fields optional and validated; empty strings clear a value. */
    @PutMapping("/profile")
    public ProfileResponse updateProfile(
            @RequestBody(required = false) ProfileRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        verifyCsrf(session, token);
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nothing to save.");
        }
        String firstName = cleanProfileField(body.firstName(), 80, "first name");
        String surname = cleanProfileField(body.surname(), 80, "surname");
        String email = body.contactEmail() == null || body.contactEmail().isBlank()
                ? null : body.contactEmail().trim();
        if (email != null && (email.length() > 200 || !EMAIL.matcher(email).matches())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }
        String whatsapp = body.whatsapp() == null || body.whatsapp().isBlank()
                ? null : body.whatsapp().replaceAll("[\\s\\-()]", "");
        if (whatsapp != null && (whatsapp.length() > 30 || !whatsapp.matches("\\+?[0-9]+"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Enter a valid WhatsApp number, digits only (a leading + is allowed).");
        }
        repository.updateProfile(user, firstName, surname, email, whatsapp);
        return new ProfileResponse(firstName, surname, email, whatsapp);
    }

    private static String cleanProfileField(String value, int maxLength, String label) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim().replaceAll("\\s+", " ");
        if (trimmed.length() > maxLength || !NAME.matcher(trimmed).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Enter a valid " + label + " (letters, spaces, hyphens and apostrophes only).");
        }
        return trimmed;
    }

    /** Always returns 202 so an unknown email reveals nothing. */
    @PostMapping("/forgot-password")
    public Map<String, Boolean> forgotPassword(
            @RequestBody(required = false) RecoveryEmailRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpServletRequest request) {
        verifyCsrf(request.getSession(false), token);
        boolean dispatched = body != null && body.email() != null
                && EMAIL.matcher(body.email()).matches()
                && recovery.requestReset(body.email());
        if (!dispatched) {
            log.debug("No reset dispatched (unknown email or rate limit). Responding identically either way.");
        }
        return Map.of("dispatched", true);  // constant response: never reveal account existence
    }

    @PostMapping("/reset-password")
    public void resetPassword(
            @RequestBody(required = false) ResetRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpServletRequest request) {
        verifyCsrf(request.getSession(false), token);
        if (body == null || !recovery.resetPassword(body.token(), body.newPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "That reset link is invalid or has expired.");
        }
    }

    private AuthResponse startSession(String username, HttpServletRequest request) {
        HttpSession previous = request.getSession(false);
        if (previous != null) previous.invalidate();
        HttpSession session = request.getSession(true);
        session.setAttribute(ShowcaseSession.USER_ATTRIBUTE, username);
        return new AuthResponse(username, ShowcaseSession.csrf(session));
    }

    private void verifyCsrf(HttpSession session, String token) {
        if (session == null || token == null
                || !ShowcaseSession.csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }
    }

    private boolean validUsername(String username) {
        return username != null && USERNAME.matcher(username).matches();
    }

    private boolean validPassword(String password) {
        return password != null
                && password.length() >= MIN_PASSWORD_LENGTH
                && password.length() <= MAX_PASSWORD_LENGTH;
    }

    private String normalizeUsername(String username) {
        return username.toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Username or password is incorrect.");
    }

    public record CredentialsRequest(String username, String password) { }
    public record RecoveryEmailRequest(String email) { }
    public record ResetRequest(String token, String newPassword) { }
    public record ProfileRequest(String firstName, String surname, String contactEmail, String whatsapp) { }
    public record ProfileResponse(String firstName, String surname, String contactEmail, String whatsapp) { }
    public record CsrfResponse(String csrfToken) { }
    public record AuthResponse(String username, String csrfToken) { }
}
