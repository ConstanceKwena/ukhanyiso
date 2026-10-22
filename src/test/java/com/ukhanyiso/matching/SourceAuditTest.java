package com.ukhanyiso.matching;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.URI;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * "Every data row has an official source", checked against the live database (not just the CSV).
 * A failure lists the rows that break the rule.
 */
@SpringBootTest
class SourceAuditTest {

    private static final Set<String> OFFICIAL_DOMAINS = Set.of("uj.ac.za", "up.ac.za", "tut.ac.za");

    @Autowired
    JdbcTemplate jdbc;

    private List<String> rows(String sql) {
        return jdbc.query(sql, (rs, n) -> rs.getString(1));
    }

    private static boolean onOfficialDomain(String link) {
        try {
            String host = URI.create(link).getHost();
            return host != null && OFFICIAL_DOMAINS.stream().anyMatch(d -> host.equals(d) || host.endsWith("." + d));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Test
    void everyCourseHasAnOfficialSource() {
        assertEquals(List.of(), rows("SELECT c.course_id FROM courses c LEFT JOIN sources s ON s.source_id = c.source_id "
                + "WHERE s.source_id IS NULL OR s.source_type <> 'official'"));
    }

    @Test
    void everyRequirementHasAnOfficialSource() {
        assertEquals(List.of(), rows("SELECT CAST(r.req_id AS VARCHAR(20)) FROM course_requirements r "
                + "LEFT JOIN sources s ON s.source_id = r.source_id WHERE s.source_id IS NULL OR s.source_type <> 'official'"));
    }

    @Test
    void everyInstitutionHasAnOfficialSource() {
        assertEquals(List.of(), rows("SELECT i.institution_id FROM institutions i LEFT JOIN sources s ON s.source_id = i.source_id "
                + "WHERE s.source_id IS NULL OR s.source_type <> 'official'"));
    }

    @Test
    void courseSourcesAreVerifiedOrPartial() {
        assertEquals(List.of(), rows("SELECT c.course_id FROM courses c JOIN sources s ON s.source_id = c.source_id "
                + "WHERE s.status NOT IN ('verified', 'partial')"));
    }

    @Test
    void feesAndClosingTimesAreNotStoredWithoutAnOfficialSource() {
        assertEquals(List.of(), rows("SELECT institution_id FROM institutions WHERE app_fee_rand IS NOT NULL"));
        assertEquals(List.of(), rows("SELECT course_id FROM courses WHERE closing_time IS NOT NULL"));
    }

    @Test
    void everyLinkIsOnAnOfficialInstitutionDomain() {
        List<String> bad = new java.util.ArrayList<>();
        for (String sql : List.of("SELECT official_link FROM sources", "SELECT course_url FROM courses",
                "SELECT apply_url FROM institutions")) {
            for (String link : rows(sql)) if (!onOfficialDomain(link)) bad.add(link);
        }
        assertTrue(bad.isEmpty(), "Links not on an official domain: " + bad);
    }
}
