package com.ukhanyiso.matching;

import com.ukhanyiso.matching.catalog.Course;
import com.ukhanyiso.matching.catalog.Institution;
import com.ukhanyiso.matching.catalog.MatchConfig;
import com.ukhanyiso.matching.catalog.Requirement;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * TVET college courses (SWGC) do not use a university APS: the official
 * admission policy
 * lists per-subject percentage passes. The NO_APS institution method means the
 * matcher
 * judges the subject groups only and never reports an APS shortfall.
 * Requirements come from
 * https://www.swgc.co.za/wp-content/uploads/2026/01/Student-Admission-Policy_2025-08-28.pdf
 */
class TvetMatcherTest {
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 25, 9, 0);

    private static final Institution SWGC = new Institution("SWGC", "South West Gauteng TVET College", "NO_APS", true,
            false, "https://www.swgc.co.za");

    /** NC(V) IT L2: English 40%, Mathematics 50% (policy section 13 xi). */
    private static Course ncVIt() {
        return new Course("SWGC-NCV-IT", "SWGC", "NC(V) Information Technology and Computer Science (Level 2)",
                "ncv", null, null, null, "https://www.swgc.co.za", "verified", null,
                List.of(new Requirement(1, 1, "ENG_HL", 2, null, 40),
                        new Requirement(2, 1, "ENG_FAL", 2, null, 40),
                        new Requirement(3, 2, "MATHS", 3, null, 50)));
    }

    @Test
    void ncVCourseMatchesOnSubjectsAloneWithoutAnAps() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("ENG_FAL", 55, true),
                new ApsCalculator.SubjectMark("MATHS", 55, true));
        CourseResult r = Matcher.evaluate(marks, ncVIt(), SWGC, MatchConfig.defaults(), Map.of(), NOW);
        assertEquals(FitStatus.MATCH, r.fit());
        assertNull(r.requiredAps(), "TVET courses have no APS requirement");
        assertNull(r.yourAps(), "No APS is reported for a NO_APS institution");
    }

    @Test
    void subjectShortfallIsReportedInPercentagesNotApsPoints() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("ENG_FAL", 55, true),
                new ApsCalculator.SubjectMark("MATHS", 42, true));
        CourseResult r = Matcher.evaluate(marks, ncVIt(), SWGC, MatchConfig.defaults(), Map.of(), NOW);
        // 42% is Level 3, needs 50%: one gap -> NEAR_MISS, and no APS shortfall can be reported
        assertEquals(FitStatus.NEAR_MISS, r.fit());
    }

    @Test
    void missingEnglishIsANearMissNotAHardFail() {
        var marks = List.of(new ApsCalculator.SubjectMark("MATHS", 70, true));
        CourseResult r = Matcher.evaluate(marks, ncVIt(), SWGC, MatchConfig.defaults(), Map.of(), NOW);
        assertEquals(FitStatus.NEAR_MISS, r.fit());
        assertTrue(r.reasons().stream().anyMatch(s -> s.contains("It is not in your marks.")));
    }

    @Test
    void failingTwoSubjectsIsNoMatch() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("ENG_FAL", 30, true),
                new ApsCalculator.SubjectMark("MATHS", 20, true));
        CourseResult r = Matcher.evaluate(marks, ncVIt(), SWGC, MatchConfig.defaults(), Map.of(), NOW);
        assertEquals(FitStatus.NO_MATCH, r.fit());
        assertEquals(2, r.reasons().size());
    }
}
