package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.api.MarksValidator;
import com.ukhanyiso.matching.api.MatchRequest;
import com.ukhanyiso.matching.api.MatchRequest.MarkEntry;
import com.ukhanyiso.matching.catalog.Course;
import com.ukhanyiso.matching.catalog.Institution;
import com.ukhanyiso.matching.catalog.MatchConfig;
import com.ukhanyiso.matching.catalog.Requirement;
import com.ukhanyiso.matching.catalog.SubjectCatalog;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Hand-calculated cases P-01 to P-07 from docs/path-to-yes.md, date fixed at 21 Oct 2026. The two UJ courses are built
 * here with the same requirements as data.sql, so this test needs no database.
 */
class PathToYesTest {
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 21, 9, 0);
    private static final Institution UJ =
            new Institution("UJ", "University of Johannesburg", "BEST6_EXCL_LO", false, false, "https://www.uj.ac.za");

    private static Course course(String id, String name, int aps, int mathsLevel, int engLevel, LocalDate closing) {
        return new Course(id, "UJ", name, "bachelor", aps, closing, null, "https://www.uj.ac.za", "verified",
                LocalDate.of(2026, 10, 16), List.of(
                new Requirement(1, 1, "ENG_HL", engLevel, null, null),
                new Requirement(2, 1, "ENG_FAL", engLevel, null, null),
                new Requirement(3, 2, "MATHS", mathsLevel, null, null)));
    }

    private static final Course ACC = course("UJ-BCOM-ACC", "BCom in Accounting", 28, 4, 4, LocalDate.of(2026, 10, 31));
    private static final Course CSI = course("UJ-BSC-CSI", "BSc Computer Science", 30, 6, 5, LocalDate.of(2026, 10, 31));

    private static List<SubjectMark> learner(String... a) {
        List<MarkEntry> e = new ArrayList<>();
        for (int i = 0; i < a.length; i += 2) e.add(new MarkEntry(a[i], Integer.valueOf(a[i + 1])));
        return MarksValidator.validate(new MatchRequest(e));
    }

    private static Map<String, String> names() {
        Map<String, String> m = new HashMap<>();
        for (String n : SubjectCatalog.ALL_NAMES) m.put(SubjectCatalog.idFor(n), n);
        return m;
    }

    private static List<PathToYes.Option> path(Course c, List<SubjectMark> l) {
        CourseResult base = Matcher.evaluate(l, c, UJ, MatchConfig.defaults(), names(), NOW);
        return PathToYes.find(l, c, UJ, MatchConfig.defaults(), names(), NOW, base);
    }

    private static String text(List<PathToYes.Option> options) {
        StringBuilder sb = new StringBuilder();
        for (var o : options) {
            sb.append('[');
            o.changes().forEach(c -> sb.append(c.subject()).append(' ').append(c.fromPercent()).append("->").append(c.toPercent()).append(';'));
            sb.append('+').append(o.totalPoints()).append(']');
        }
        return sb.toString();
    }

    @Test
    void p01LifeOrientationIsNeverSuggested() {
        var p = path(ACC, learner("English Home Language", "62", "Accounting", "66", "Economics", "61", "Mathematics", "58",
                "Geography", "52", "Business Studies", "55", "Life Orientation", "79"));
        assertEquals("[Mathematics 58->60;+2][Accounting 66->70;+4]", text(p));
    }

    @Test
    void p02SecondOptionUsesDifferentSubjects() {
        var p = path(ACC, learner("English Home Language", "61", "Accounting", "63", "Mathematics", "57", "Business Studies", "58",
                "Geography", "59", "Economics", "52", "Life Orientation", "70"));
        assertEquals("[Business Studies 58->60;Geography 59->60;+3][Accounting 63->70;Mathematics 57->60;+10]", text(p));
    }

    @Test
    void p03SubjectGapGivesOneOption() {
        var p = path(CSI, learner("English Home Language", "75", "Mathematics", "65", "Physical Sciences", "72", "Life Sciences", "68",
                "Geography", "66", "Accounting", "71", "Life Orientation", "60"));
        assertEquals("[Mathematics 65->70;+5]", text(p));
    }

    @Test
    void p04SeventhSubjectThatAddsNothingIsNotSuggested() {
        var p = path(ACC, learner("English Home Language", "62", "Accounting", "64", "Business Studies", "61", "Mathematics", "56",
                "Geography", "58", "Economics", "52", "History", "49", "Life Orientation", "70"));
        assertEquals("[Geography 58->60;+2][Mathematics 56->60;+4]", text(p));
    }

    @Test
    void p05NothingWithinTheFifteenPointLimit() {
        var p = path(ACC, learner("English Home Language", "60", "Accounting", "61", "Mathematics", "50", "Business Studies", "51",
                "Geography", "52", "Economics", "51", "Life Orientation", "70"));
        assertTrue(p.isEmpty());
    }

    @Test
    void p06ClosedCourseHasNoPath() {
        Course closed = course("X", "Closed course", 30, 6, 5, LocalDate.of(2026, 6, 30));
        var l = learner("English Home Language", "75", "Mathematics", "65", "Physical Sciences", "72", "Life Sciences", "68",
                "Geography", "66", "Accounting", "71", "Life Orientation", "60");
        assertTrue(path(closed, l).isEmpty());
    }

    @Test
    void p07MatchAndNoMatchHaveNoPath() {
        var l = learner("English Home Language", "72", "Mathematics", "65", "Accounting", "62", "Business Studies", "55",
                "Geography", "52", "isiZulu First Additional Language", "58", "Life Orientation", "85");
        assertTrue(path(ACC, l).isEmpty());   // already meets the minimum
        assertTrue(path(CSI, l).isEmpty());   // gap too big to call a path
    }

    @Test
    void everySuggestionReallyMakesTheCourseAMatch() {
        var l = learner("English Home Language", "61", "Accounting", "63", "Mathematics", "57", "Business Studies", "58",
                "Geography", "59", "Economics", "52", "Life Orientation", "70");
        for (var option : path(ACC, l)) {
            List<SubjectMark> changed = new ArrayList<>(l);
            for (var ch : option.changes()) {
                for (int i = 0; i < changed.size(); i++) {
                    SubjectMark m = changed.get(i);
                    if (names().get(m.subjectId()).equals(ch.subject())) {
                        changed.set(i, new SubjectMark(m.subjectId(), ch.toPercent(), m.countsInAps()));
                    }
                }
            }
            assertEquals(FitStatus.MATCH, Matcher.evaluate(changed, ACC, UJ, MatchConfig.defaults(), names(), NOW).fit());
        }
    }
}
