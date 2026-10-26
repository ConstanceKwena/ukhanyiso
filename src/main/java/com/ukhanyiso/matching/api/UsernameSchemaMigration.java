package com.ukhanyiso.matching.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.util.List;
import java.util.Locale;

@Component
public class UsernameSchemaMigration implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(UsernameSchemaMigration.class);
    private static final String LENGTH_CONSTRAINT = "app_users_username_length_check";
    private final JdbcTemplate jdbc;

    public UsernameSchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        migrate();
    }

    void migrate() {
        String database = jdbc.execute((ConnectionCallback<String>) connection ->
                connection.getMetaData().getDatabaseProductName()).toLowerCase(Locale.ROOT);
        List<CheckConstraint> checks = database.contains("postgres")
                ? postgresChecks()
                : h2Checks();

        for (CheckConstraint check : checks) {
            if (check.definition().toLowerCase(Locale.ROOT).contains("user_id")
                    && check.definition().toLowerCase(Locale.ROOT).contains("length")) {
                jdbc.execute("ALTER TABLE app_users DROP CONSTRAINT \""
                        + check.name().replace("\"", "\"\"") + "\"");
            }
        }

        if (database.contains("postgres")) {
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN user_id TYPE VARCHAR(100)");
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN display_name TYPE VARCHAR(100)");
        } else {
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN user_id VARCHAR(100)");
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN display_name VARCHAR(100)");
        }
        jdbc.execute("ALTER TABLE app_users ADD CONSTRAINT " + LENGTH_CONSTRAINT
                + " CHECK (LENGTH(user_id) BETWEEN 3 AND 100)");

        // Password recovery and optional profile details, added after the first release.
        // ADD COLUMN IF NOT EXISTS works on H2 and PostgreSQL.
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS recovery_hash VARCHAR(64)");
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS recovery_salt VARCHAR(64)");
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(80)");
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS surname VARCHAR(80)");
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS contact_email VARCHAR(200)");
        jdbc.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(30)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS password_resets (\n"
                + "    token_hash  VARCHAR(64) PRIMARY KEY,\n"
                + "    user_id     VARCHAR(100) NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,\n"
                + "    expires_at  TIMESTAMP   NOT NULL,\n"
                + "    used_at     TIMESTAMP,\n"
                + "    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
                + ")");
        jdbc.execute("CREATE TABLE IF NOT EXISTS learner_marks (\n"
                + "    user_id   VARCHAR(100) NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,\n"
                + "    subject   VARCHAR(100) NOT NULL,\n"
                + "    mark      INTEGER NOT NULL CHECK (mark BETWEEN 0 AND 100),\n"
                + "    PRIMARY KEY (user_id, subject)\n"
                + ")");

        // Reset tokens point at the account, so that column must hold an email too.
        // Best effort: if it cannot be widened, startup still succeeds and only resets for very long emails are affected.
        try {
            jdbc.execute(database.contains("postgres")
                    ? "ALTER TABLE password_resets ALTER COLUMN user_id TYPE VARCHAR(100)"
                    : "ALTER TABLE password_resets ALTER COLUMN user_id VARCHAR(100) NOT NULL");
        } catch (RuntimeException exception) {
            log.warn("Could not widen password_resets.user_id to 100 characters: {}", exception.getMessage());
        }
    }

    private List<CheckConstraint> h2Checks() {
        return jdbc.query("""
                SELECT tc.CONSTRAINT_NAME, cc.CHECK_CLAUSE
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
                  ON tc.CONSTRAINT_CATALOG = cc.CONSTRAINT_CATALOG
                 AND tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
                 AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
                WHERE tc.TABLE_NAME = 'APP_USERS'
                  AND tc.CONSTRAINT_TYPE = 'CHECK'
                """, (rs, row) -> new CheckConstraint(
                rs.getString("CONSTRAINT_NAME"), rs.getString("CHECK_CLAUSE")));
    }

    private List<CheckConstraint> postgresChecks() {
        return jdbc.query("""
                SELECT conname, pg_get_constraintdef(oid) AS check_clause
                FROM pg_constraint
                WHERE conrelid = 'app_users'::regclass
                  AND contype = 'c'
                """, (rs, row) -> new CheckConstraint(
                rs.getString("conname"), rs.getString("check_clause")));
    }

    private record CheckConstraint(String name, String definition) { }
}
