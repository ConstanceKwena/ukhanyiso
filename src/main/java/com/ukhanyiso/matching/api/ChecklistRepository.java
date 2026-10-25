package com.ukhanyiso.matching.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
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