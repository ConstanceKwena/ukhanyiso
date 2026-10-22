package com.ukhanyiso.matching.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import jakarta.annotation.PostConstruct;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class ChecklistRepository {
    private final JdbcTemplate jdbc;
    private final PasswordHasher hasher;

    public ChecklistRepository(JdbcTemplate jdbc, PasswordHasher hasher) {
        this.jdbc = jdbc;
        this.hasher = hasher;
    }

    @PostConstruct
    void seedDemoUser() {
        if (jdbc.queryForObject("SELECT COUNT(*) FROM app_users WHERE user_id = ?", Integer.class, DemoAccount.EMAIL) == 0) {
            jdbc.update("INSERT INTO app_users (user_id, password_hash, display_name) VALUES (?, ?, ?)",
                    DemoAccount.EMAIL, hasher.hash(DemoAccount.PASSWORD), DemoAccount.DISPLAY_NAME);
        }
    }

    public String passwordHash(String userId) {
        return jdbc.query("SELECT password_hash FROM app_users WHERE user_id = ?",
                rs -> rs.next() ? rs.getString(1) : null, userId);
    }

    public boolean passwordMatches(String userId, String password) {
        String hash = passwordHash(userId);
        return hash != null && hasher.matches(password, hash);
    }

    public Map<String, Boolean> progress(String userId) {
        return jdbc.query("SELECT item_id, completed FROM checklist_progress WHERE user_id = ?", (rs, row) ->
                Map.entry(rs.getString(1), rs.getInt(2) == 1), userId)
                .stream().collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public void save(String userId, String itemId, boolean completed) {
        int updated = jdbc.update("UPDATE checklist_progress SET completed = ?, updated_at = ? WHERE user_id = ? AND item_id = ?",
                completed ? 1 : 0, Timestamp.from(Instant.now()), userId, itemId);
        if (updated == 0) {
            jdbc.update("INSERT INTO checklist_progress (user_id, item_id, completed, updated_at) VALUES (?, ?, ?, ?)",
                    userId, itemId, completed ? 1 : 0, Timestamp.from(Instant.now()));
        }
    }
}
