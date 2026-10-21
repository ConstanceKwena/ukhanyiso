package com.ukhanyiso.matching.catalog;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only access to the iteration-0 tables (courses, requirements, institutions, subjects, match_config, sources).
 * Security: every query is a fixed string with no user input, so there is nothing to inject into. Nothing here writes.
 */
@Repository
public class CatalogRepository {

    private final JdbcTemplate jdbc;

    public CatalogRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Catalog load() {
        return new Catalog(courses(), institutions(), matchConfig(), subjectNames());
    }

    List<Course> courses() {
        Map<String, List<Requirement>> reqs = new LinkedHashMap<>();
        jdbc.query("SELECT req_id, course_id, group_id, subject_id, min_level, aps_required, min_percent "
                        + "FROM course_requirements ORDER BY course_id, group_id, req_id",
                (rs, n) -> {
                    reqs.computeIfAbsent(rs.getString("course_id"), k -> new ArrayList<>())
                            .add(new Requirement(rs.getLong("req_id"), rs.getInt("group_id"), rs.getString("subject_id"),
                                    rs.getInt("min_level"), rs.getObject("aps_required", Integer.class),
                                    rs.getObject("min_percent", Integer.class)));
                    return Boolean.TRUE;
                });

        return jdbc.query("SELECT c.course_id, c.institution_id, c.name, c.qualification, c.min_aps, c.closing_date, "
                        + "c.closing_time, c.course_url, s.status AS source_status, s.date_checked AS source_checked "
                        + "FROM courses c JOIN sources s ON s.source_id = c.source_id ORDER BY c.course_id",
                (rs, n) -> new Course(rs.getString("course_id"), rs.getString("institution_id"), rs.getString("name"),
                        rs.getString("qualification"), rs.getObject("min_aps", Integer.class),
                        rs.getObject("closing_date", LocalDate.class), rs.getObject("closing_time", LocalTime.class),
                        rs.getString("course_url"), rs.getString("source_status"),
                        rs.getObject("source_checked", LocalDate.class),
                        reqs.getOrDefault(rs.getString("course_id"), List.of())));
    }

    Map<String, Institution> institutions() {
        Map<String, Institution> out = new LinkedHashMap<>();
        jdbc.query("SELECT institution_id, name, aps_method, aps_method_verified, exclude_level_one, apply_url "
                        + "FROM institutions ORDER BY institution_id",
                (rs, n) -> {
                    Institution i = new Institution(rs.getString("institution_id"), rs.getString("name"),
                            rs.getString("aps_method"), rs.getInt("aps_method_verified") == 1,
                            rs.getInt("exclude_level_one") == 1, rs.getString("apply_url"));
                    out.put(i.institutionId(), i);
                    return Boolean.TRUE;
                });
        return out;
    }

    MatchConfig matchConfig() {
        List<MatchConfig> rows = jdbc.query("SELECT aps_tolerance, level_tolerance, max_gaps_for_near, "
                        + "closing_soon_days, likely_aps_margin FROM match_config",
                (rs, n) -> new MatchConfig(rs.getInt("aps_tolerance"), rs.getInt("level_tolerance"),
                        rs.getInt("max_gaps_for_near"), rs.getInt("closing_soon_days"), rs.getInt("likely_aps_margin")));
        return rows.isEmpty() ? MatchConfig.defaults() : rows.get(0);
    }

    Map<String, String> subjectNames() {
        Map<String, String> out = new LinkedHashMap<>();
        jdbc.query("SELECT subject_id, name FROM subjects", (rs, n) -> {
            out.put(rs.getString("subject_id"), rs.getString("name"));
            return Boolean.TRUE;
        });
        return out;
    }
}
