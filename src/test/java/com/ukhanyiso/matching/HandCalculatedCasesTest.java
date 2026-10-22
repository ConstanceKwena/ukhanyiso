package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.api.MarksValidator;
import com.ukhanyiso.matching.api.MatchRequest;
import com.ukhanyiso.matching.api.MatchRequest.MarkEntry;
import com.ukhanyiso.matching.catalog.Catalog;
import com.ukhanyiso.matching.catalog.CatalogRepository;
import com.ukhanyiso.matching.catalog.Course;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * The five hand-calculated learners in docs/test-cases-matching.md (M-01 to M-05), run through the real
 * validator, the real database and the real matcher. Time is fixed at 2026-10-21 as in that document.
 * Each expectation is "caseId|courseId|FIT|LABEL".
 */
@SpringBootTest
class HandCalculatedCasesTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 21, 9, 0);

    @Autowired
    CatalogRepository repository;

    private CourseResult run(List<SubjectMark> learner, Catalog catalog, String courseId) {
        Course c = catalog.courses().stream().filter(k -> k.courseId().equals(courseId)).findFirst().orElseThrow();
        return Matcher.evaluate(learner, c, catalog.institutions().get(c.institutionId()), catalog.config(),
                catalog.subjectNames(), NOW);
    }

    private List<SubjectMark> learner(String... subjectAndMark) {
        List<MarkEntry> entries = new ArrayList<>();
        for (int i = 0; i < subjectAndMark.length; i += 2) {
            entries.add(new MarkEntry(subjectAndMark[i], Integer.valueOf(subjectAndMark[i + 1])));
        }
        return MarksValidator.validate(new MatchRequest(entries));
    }

    private void check(List<SubjectMark> learner, String... expectations) {
        Catalog catalog = repository.load();
        for (String e : expectations) {
            String[] x = e.split("\\|");
            CourseResult r = run(learner, catalog, x[1]);
            assertEquals(x[2], r.fit().name(), x[0] + " fit");
            assertEquals(x[3], r.label().name(), x[0] + " label");
        }
    }

    @Test
    void m01ExactlyAtCutoffTwoGapsThreePointsShort() {
        check(learner("English Home Language", "72", "Mathematics", "65", "Accounting", "62", "Business Studies", "55",
                        "Geography", "52", "isiZulu First Additional Language", "58", "Life Orientation", "85"),
                "M-01a|UJ-BCOM-ACC|MATCH|POSSIBLE", "M-01b|UJ-BED-FP|MATCH|POSSIBLE",
                "M-01c|UJ-BSC-CSI|NO_MATCH|UNLIKELY", "M-01d|UJ-LLB|NO_MATCH|UNLIKELY", "M-01e|TUT-DIP-CS|MATCH|POSSIBLE");
    }

    @Test
    void m02NearMissOnAps() {
        check(learner("English Home Language", "75", "Mathematics", "72", "Physical Sciences", "65", "Life Sciences", "62",
                        "Geography", "55", "History", "45", "Life Orientation", "70"),
                "M-02a|UJ-BSC-CSI|NEAR_MISS|UNLIKELY", "M-02b|UP-BSC-CS|NEAR_MISS|UNLIKELY",
                "M-02c|UJ-BCOM-ACC|MATCH|POSSIBLE", "M-02d|TUT-DIP-CSE|MATCH|LIKELY");
    }

    @Test
    void m03NearMissOnASubjectAndASubjectNotTaken() {
        check(learner("English Home Language", "85", "Mathematics", "65", "Physical Sciences", "85", "Life Sciences", "82",
                        "Accounting", "80", "Geography", "75", "Life Orientation", "60"),
                "M-03a|UJ-BSC-CSI|NEAR_MISS|UNLIKELY", "M-03b|UP-BENG-MECH4|NEAR_MISS|UNLIKELY",
                "M-03c|UJ-BCOM-ACC|MATCH|LIKELY", "M-03d|UJ-LLB|NO_MATCH|UNLIKELY");
    }

    @Test
    void m04MathematicalLiteracy() {
        check(learner("English Home Language", "78", "Mathematical Literacy", "85", "Life Sciences", "72", "Geography", "70",
                        "Business Studies", "66", "isiZulu First Additional Language", "74", "Life Orientation", "80"),
                "M-04a|UJ-BCOM-ACC|NO_MATCH|UNLIKELY", "M-04b|UJ-LLB|MATCH|LIKELY", "M-04c|UP-LLB|MATCH|POSSIBLE",
                "M-04d|TUT-DIP-CS|MATCH|LIKELY", "M-04e|TUT-DIP-CSE|NO_MATCH|UNLIKELY");
    }

    @Test
    void m05LifeOrientationAndApsThatDiffersPerInstitution() {
        List<SubjectMark> l = learner("English Home Language", "72", "Mathematics", "65", "Physical Sciences", "62",
                "Life Sciences", "60", "Geography", "55", "Accounting", "20", "Life Orientation", "90");
        check(l, "M-05a|UJ-BCOM-ACC|NEAR_MISS|UNLIKELY", "M-05b|TUT-DIP-CS|NEAR_MISS|UNLIKELY",
                "M-05c|UJ-BSC-CSI|NO_MATCH|UNLIKELY");
        Catalog catalog = repository.load();
        assertEquals(26, run(l, catalog, "UJ-BCOM-ACC").yourAps(), "UJ counts the level-1 subject");
        assertEquals(25, run(l, catalog, "TUT-DIP-CS").yourAps(), "TUT drops the level-1 subject");
    }
}
