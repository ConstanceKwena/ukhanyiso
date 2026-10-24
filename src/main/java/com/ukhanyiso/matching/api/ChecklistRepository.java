package com.ukhanyiso.matching.api;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import jakarta.annotation.PostConstruct;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class ChecklistRepository {
    private final JdbcTemplate jdbc;
    private final PasswordHasher hasher;
    private final String dummyHash;

    public ChecklistRepository(JdbcTemplate jdbc, PasswordHasher hasher) {
        this.jdbc = jdbc;
        this.hasher = hasher;
        this.dummyHash = hasher.hash("not-a-real-password");
    }

    @PostConstruct
    public void init() {
        String email = DemoAccount.EMAIL.trim().toLowerCase(Locale.ROOT);
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM app_users WHERE user_id = ?", Integer.class, email);
        if (count == null || count == 0) {
            jdbc.update(
                "INSERT INTO app_users (user_id, password_hash, display_name, preferred_language, consent_at, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
                email,
                hasher.hash(DemoAccount.PASSWORD),
                DemoAccount.DISPLAY_NAME,
                "en",
                Timestamp.from(Instant.now()),
                Timestamp.from(Instant.now())
            );
        }
    }

    private String passwordHash(String userId) {
        return jdbc.query("SELECT password_hash FROM app_users WHERE user_id = ?",
                rs -> rs.next() ? rs.getString(1) : null, userId);
    }

    public boolean passwordMatches(String userId, String password) {
        String hash = passwordHash(userId);
        if (hash == null) {
            hasher.matches(password, dummyHash);
            return false;
        }
        return hasher.matches(password, hash);
    }

    public boolean createUser(String email, String password, String language) {
        try {
            jdbc.update("INSERT INTO app_users (user_id, password_hash, display_name, preferred_language, consent_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    email, hasher.hash(password), "Learner", language, Timestamp.from(Instant.now()), Timestamp.from(Instant.now()));
            return true;
        } catch (DuplicateKeyException e) {
            return false;
        }
    }

    public String displayName(String userId) {
        return jdbc.query("SELECT display_name FROM app_users WHERE user_id = ?",
                rs -> rs.next() ? rs.getString(1) : "Learner", userId);
    }

    public ChecklistController.PlanData plan(String userId) {
        return jdbc.query("SELECT monthly_funding, months_funded, required_avg, current_avg, bursary_worth, startup_costs, weeks_to_payout, cost_home, cost_food, cost_travel, cost_data, cost_other FROM financial_plans WHERE user_id = ?",
                rs -> rs.next() ? new ChecklistController.PlanData(rs.getInt(1), rs.getInt(2), rs.getInt(3), rs.getInt(4),
                        rs.getInt(5), rs.getInt(6), rs.getInt(7), rs.getInt(8), rs.getInt(9), rs.getInt(10), rs.getInt(11), rs.getInt(12)) : null,
                userId);
    }

    public void savePlan(String userId, ChecklistController.PlanData p) {
        Timestamp now = Timestamp.from(Instant.now());
        int updated = jdbc.update("UPDATE financial_plans SET monthly_funding = ?, months_funded = ?, required_avg = ?, current_avg = ?, bursary_worth = ?, startup_costs = ?, weeks_to_payout = ?, cost_home = ?, cost_food = ?, cost_travel = ?, cost_data = ?, cost_other = ?, updated_at = ? WHERE user_id = ?",
                p.funding(), p.months(), p.required(), p.current(), p.worth(), p.startup(), p.weeks(), p.home(), p.food(), p.travel(), p.data(), p.other(), now, userId);
        if (updated == 0) {
            jdbc.update("INSERT INTO financial_plans (user_id, monthly_funding, months_funded, required_avg, current_avg, bursary_worth, startup_costs, weeks_to_payout, cost_home, cost_food, cost_travel, cost_data, cost_other, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    userId, p.funding(), p.months(), p.required(), p.current(), p.worth(), p.startup(), p.weeks(), p.home(), p.food(), p.travel(), p.data(), p.other(), now);
        }
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