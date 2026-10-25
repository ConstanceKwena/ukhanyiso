package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class ShowcaseAuthController {
    private static final Pattern USERNAME = Pattern.compile("[a-zA-Z0-9_-]{3,50}");
    private static final int MIN_PASSWORD_LENGTH = 12;
    private static final int MAX_PASSWORD_LENGTH = 128;
    private static final PasswordHasher.Credentials DUMMY_CREDENTIALS =
            new PasswordHasher.Credentials(
                    "AAAAAAAAAAAAAAAAAAAAAA==",
                    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    private final ChecklistRepository repository;
    private final PasswordHasher passwordHasher = new PasswordHasher();

    public ShowcaseAuthController(ChecklistRepository repository) {
        this.repository = repository;
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
    public record CsrfResponse(String csrfToken) { }
    public record AuthResponse(String username, String csrfToken) { }
}
