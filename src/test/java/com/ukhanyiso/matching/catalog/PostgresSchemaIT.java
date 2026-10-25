package com.ukhanyiso.matching.catalog;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Runs the real schema.sql + data.sql against a live PostgreSQL database and
 * checks the
 * catalogue reads back. Skipped (never fails) unless env vars point at a
 * Postgres:
 *
 * SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ukhanyiso_test
 * SPRING_DATASOURCE_USERNAME=postgres
 * SPRING_DATASOURCE_PASSWORD=postgres
 * SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
 *
 * mvn test -Dtest=PostgresSchemaIT
 */
@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PostgresSchemaIT {

    @Autowired
    CatalogRepository repository;
    @Autowired
    JdbcTemplate jdbc;

    @BeforeAll
    void requireLivePostgres() {
        String url = System.getenv("SPRING_DATASOURCE_URL");
        Assumptions.assumeTrue(url != null && url.startsWith("jdbc:postgresql"),
                "SPRING_DATASOURCE_URL not set to a Postgres database; skipping");
        try (Connection ignored = DriverManager.getConnection(url,
                System.getenv().getOrDefault("SPRING_DATASOURCE_USERNAME", "postgres"),
                System.getenv().getOrDefault("SPRING_DATASOURCE_PASSWORD", "postgres"))) {
            // reachable
        } catch (Exception exception) {
            Assumptions.assumeTrue(false, "Postgres not reachable at " + url + ": " + exception.getMessage());
        }
    }

    @Test
    void schemaAndDataLoadIntoPostgres() {
        String database = jdbc
                .execute((Connection con) -> con.getMetaData().getDatabaseProductName())
                .toLowerCase(Locale.ROOT);
        assertTrue(database.contains("postgres"), "expected PostgreSQL, got " + database);
        assertTrue(repository.load().courses().size() >= 12,
                "catalogue should load from Postgres");
    }
}
