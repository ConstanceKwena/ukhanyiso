package com.ukhanyiso.matching.api;

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
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN user_id TYPE VARCHAR(50)");
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN display_name TYPE VARCHAR(50)");
        } else {
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN user_id VARCHAR(50)");
            jdbc.execute("ALTER TABLE app_users ALTER COLUMN display_name VARCHAR(50)");
        }
        jdbc.execute("ALTER TABLE app_users ADD CONSTRAINT " + LENGTH_CONSTRAINT
                + " CHECK (LENGTH(user_id) BETWEEN 3 AND 50)");
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
