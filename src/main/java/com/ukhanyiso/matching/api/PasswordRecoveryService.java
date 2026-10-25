package com.ukhanyiso.matching.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

/**
 * Password recovery without storing a plaintext email anywhere.
 *
 * <p>
 * The recovery email is stored only as a per-user salted SHA-256 hash, so a
 * database
 * leak does not expose learner contact details. A reset request stores only the
 * SHA-256
 * hash of a one-time token that expires after one hour; the token itself is
 * never
 * persisted. Because this prototype has no mail provider yet, the token is
 * surfaced in
 * the application log — replace {@link #deliverToken} with a mail sender before
 * real
 * learners use recovery.
 * </p>
 */
@Service
public class PasswordRecoveryService {
    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryService.class);
    static final Duration TOKEN_LIFETIME = Duration.ofHours(1);
    private static final int MAX_TOKENS_PER_HOUR = 5;

    private final ChecklistRepository repository;
    private final SecureRandom random = new SecureRandom();

    public PasswordRecoveryService(ChecklistRepository repository) {
        this.repository = repository;
    }

    /** Stores (or replaces) the recovery email for the signed-in learner. */
    public void setRecoveryEmail(String userId, String email) {
        String normalized = normalizeEmail(email);
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        repository.setRecoveryEmail(userId, Base64.getEncoder().encodeToString(salt),
                hashEmail(normalized, salt));
    }

    public boolean hasRecoveryEmail(String userId) {
        return repository.recoveryCredentials(userId) != null;
    }

    /**
     * Starts a reset. Always succeeds from the caller's point of view: if the email
     * is
     * unknown, nothing is sent and nothing is revealed. Returns true only so tests
     * can
     * assert delivery happened.
     */
    public boolean requestReset(String email) {
        String normalized = normalizeEmail(email);
        String userId = repository.allUserIdsWithRecovery().stream()
                .filter(id -> {
                    ChecklistRepository.RecoveryCredentials stored = repository.recoveryCredentials(id);
                    byte[] salt = Base64.getDecoder().decode(stored.salt());
                    return MessageDigest.isEqual(hashEmail(normalized, salt).getBytes(StandardCharsets.UTF_8),
                            stored.hash().getBytes(StandardCharsets.UTF_8));
                })
                .findFirst().orElse(null);
        if (userId == null) {
            return false;
        }
        if (repository.recentResetCount(userId,
                Timestamp.from(Instant.now().minus(TOKEN_LIFETIME))) >= MAX_TOKENS_PER_HOUR) {
            return false;
        }
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        repository.createPasswordReset(hashToken(token), userId,
                Timestamp.from(Instant.now().plus(TOKEN_LIFETIME)));
        deliverToken(userId, token);
        return true;
    }

    /** Consumes a one-time token and replaces the account password. */
    public boolean resetPassword(String token, String newPassword) {
        if (token == null || newPassword == null
                || newPassword.length() < ShowcaseAuthController.MIN_PASSWORD_LENGTH
                || newPassword.length() > ShowcaseAuthController.MAX_PASSWORD_LENGTH) {
            return false;
        }
        String userId = repository.consumePasswordReset(hashToken(token), Timestamp.from(Instant.now()));
        if (userId == null) {
            return false;
        }
        PasswordHasher.Credentials credentials = new PasswordHasher().hash(newPassword.toCharArray());
        repository.updatePassword(userId, credentials.salt(), credentials.hash());
        return true;
    }

    /** Prototype delivery channel: no mail provider is wired yet. */
    void deliverToken(String userId, String token) {
        log.info("Password reset token for {} (prototype delivery, replace with mail): {}", userId, token);
    }

    static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String hashEmail(String normalizedEmail, byte[] salt) {
        return Base64.getEncoder().encodeToString(
                sha256(concat(salt, normalizedEmail.getBytes(StandardCharsets.UTF_8))));
    }

    static String hashToken(String token) {
        return Base64.getEncoder().encodeToString(sha256(token.getBytes(StandardCharsets.UTF_8)));
    }

    private static byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private static byte[] concat(byte[] first, byte[] second) {
        byte[] out = new byte[first.length + second.length];
        System.arraycopy(first, 0, out, 0, first.length);
        System.arraycopy(second, 0, out, first.length, second.length);
        return out;
    }
}
