package com.ukhanyiso.matching.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public class ChecklistRepository {
    private final JdbcTemplate jdbc;

    public ChecklistRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createAccount(String username, String salt, String hash) {
        jdbc.update(
                "INSERT INTO app_users (user_id, display_name, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                username, username, salt, hash, Timestamp.from(Instant.now()));
    }

    public PasswordHasher.Credentials credentials(String username) {
        return jdbc.query(
                "SELECT password_salt, password_hash FROM app_users WHERE user_id = ?",
                rs -> rs.next()
                        ? new PasswordHasher.Credentials(
                                rs.getString("password_salt"),
                                rs.getString("password_hash"))
                        : null,
                username);
    }

    public String displayName(String userId) {
        return jdbc.query("SELECT display_name FROM app_users WHERE user_id = ?",
                rs -> rs.next() ? rs.getString(1) : "Learner", userId);
    }

    public Map<String, Boolean> progress(String userId) {
        return jdbc.query("SELECT item_id, completed FROM checklist_progress WHERE user_id = ?",
                rs -> {
                    Map<String, Boolean> map = new java.util.HashMap<>();
                    while (rs.next()) {
                        map.put(rs.getString("item_id"), rs.getInt("completed") == 1);
                    }
                    return map;
                }, userId);
    }

    public void setRecoveryEmail(String userId, String recoverySalt, String recoveryHash) {
        jdbc.update("UPDATE app_users SET recovery_salt = ?, recovery_hash = ? WHERE user_id = ?",
                recoverySalt, recoveryHash, userId);
    }

    public record RecoveryCredentials(String salt, String hash) { }

    public RecoveryCredentials recoveryCredentials(String userId) {
        return jdbc.query("SELECT recovery_salt, recovery_hash FROM app_users WHERE user_id = ?",
                rs -> rs.next() && rs.getString("recovery_hash") != null
                        ? new RecoveryCredentials(rs.getString("recovery_salt"), rs.getString("recovery_hash"))
                        : null,
                userId);
    }

    public List<String> allUserIdsWithRecovery() {
        return jdbc.queryForList("SELECT user_id FROM app_users WHERE recovery_hash IS NOT NULL", String.class);
    }

    public int recentResetCount(String userId, Timestamp since) {
        Integer count = jdbc.query("SELECT COUNT(*) FROM password_resets WHERE user_id = ? AND created_at > ?",
                rs -> rs.next() ? rs.getInt(1) : 0, userId, since);
        return count == null ? 0 : count;
    }

    public void createPasswordReset(String tokenHash, String userId, Timestamp expiresAt) {
        jdbc.update("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
                tokenHash, userId, expiresAt);
    }

    /** Marks the token used and returns the owning user, or null if unknown/expired/used. */
    public String consumePasswordReset(String tokenHash, Timestamp now) {
        return jdbc.query("SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?",
                rs -> {
                    if (!rs.next()) return null;
                    String userId = rs.getString(1);
                    jdbc.update("UPDATE password_resets SET used_at = ? WHERE token_hash = ?", now, tokenHash);
                    return userId;
                }, tokenHash, now);
    }

    public void updatePassword(String userId, String salt, String hash) {
        jdbc.update("UPDATE app_users SET password_salt = ?, password_hash = ? WHERE user_id = ?",
                salt, hash, userId);
    }

    public record Profile(String firstName, String surname, String contactEmail, String whatsapp) { }

    public Profile profile(String userId) {
        return jdbc.query("SELECT first_name, surname, contact_email, whatsapp FROM app_users WHERE user_id = ?",
                rs -> rs.next()
                        ? new Profile(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4))
                        : new Profile(null, null, null, null),
                userId);
    }

    public void updateProfile(String userId, String firstName, String surname, String contactEmail, String whatsapp) {
        jdbc.update("UPDATE app_users SET first_name = ?, surname = ?, contact_email = ?, whatsapp = ? WHERE user_id = ?",
                firstName, surname, contactEmail, whatsapp, userId);
    }

    public void saveProgress(String userId, String itemId, boolean completed) {
        Timestamp now = Timestamp.from(Instant.now());
        int updated = jdbc.update("UPDATE checklist_progress SET completed = ?, updated_at = ? WHERE user_id = ? AND item_id = ?",
                completed ? 1 : 0, now, userId, itemId);
        if (updated == 0) {
            jdbc.update("INSERT INTO checklist_progress (user_id, item_id, completed, updated_at) VALUES (?, ?, ?, ?)",
                    userId, itemId, completed ? 1 : 0, now);
        }
    }
}