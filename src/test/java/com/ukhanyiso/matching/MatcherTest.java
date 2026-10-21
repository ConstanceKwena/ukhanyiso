package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.catalog.Course;
import com.ukhanyiso.matching.catalog.Institution;
import com.ukhanyiso.matching.catalog.MatchConfig;
import com.ukhanyiso.matching.catalog.Requirement;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/** Cases come from docs/matching-rules.md sections 8 and 10. Pure logic: no database, no Spring. */
class MatcherTest {

    static final MatchConfig CFG = MatchConfig.defaults();
    static final Institution VERIFIED = new Institution("UP", "University of Pretoria", "BEST6_EXCL_LO", true, false, "https://www.up.ac.za");
    static final Institution UNCONFIRMED = new Institution("UJ", "University of Johannesburg", "BEST6_EXCL_LO", false, false, "https://www.uj.ac.za");
    static final Institution TUT = new Institution("TUT", "Tshwane University of Technology", "BEST6_EXCL_LO", true, true, "https://www.tut.ac.za");
    static final Map<String, String> NAMES = Map.of("MATHS", "Mathematics", "MATHS_LIT", "Mathematical Literacy",
            "TECH_MATHS", "Technical Mathematics", "ENG_HL", "English Home Language", "ENG_FAL", "English First Additional Language",
            "PHYS_SCI", "Physical Sciences", "TECH_SCI", "Technical Sciences", "ADD_LANG", "Additional Language");
    static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 20, 9, 0);

    // ---------- helpers ----------
    static int pctFor(int level) {
        return switch (level) { case 7 -> 85; case 6 -> 75; case 5 -> 65; case 4 -> 55; case 3 -> 45; case 2 -> 35; default -> 10; };
    }

    /** English HL L5 + Maths at mathsLevel + four more subjects, sized so the best-six APS equals aps. */
    static List<SubjectMark> learner(int aps, int mathsLevel) {
        List<SubjectMark> m = new ArrayList<>();
        m.add(new SubjectMark("ENG_HL", pctFor(5), true));
        m.add(new SubjectMark("MATHS", pctFor(mathsLevel), true));
        int rest = aps - 5 - mathsLevel;
        for (int i = 0; i < 4; i++) {
            int level = Math.min(7, Math.max(1, rest - (3 - i)));
            if (rest - level < 3 - i) level = rest - (3 - i);
            level = Math.max(1, Math.min(7, level));
            m.add(new SubjectMark("OTHER" + i, pctFor(level), true));
            rest -= level;
        }
        m.add(new SubjectMark("LO", 100, false));
        return m;
    }

    static int apsOf(List<SubjectMark> marks) {
        return ApsCalculator.calculate(ApsCalculator.Method.BEST6_EXCL_LO, marks, false).aps();
    }

    static Course course(Integer minAps, LocalDate close, LocalTime time, String status, Requirement... reqs) {
        return new Course("T-1", "UP", "Test Course", "bachelor", minAps, close, time, "https://www.up.ac.za/x", status,
                LocalDate.of(2026, 10, 16), List.of(reqs));
    }

    /** minAps 28; English (HL or FAL) Level 4; Mathematics Level 4. */
    static Course generic() {
        return course(28, LocalDate.of(2026, 10, 31), LocalTime.NOON, "verified",
                new Requirement(1, 1, "ENG_HL", 4, null, null), new Requirement(2, 1, "ENG_FAL", 4, null, null),
                new Requirement(3, 2, "MATHS", 4, null, null));
    }

    static CourseResult run(List<SubjectMark> marks, Course c) {
        return Matcher.evaluate(marks, c, VERIFIED, CFG, NAMES, NOW);
    }

    // ---------- helper self-check ----------
    @Test
    void helperBuildsTheRequestedAps() {
        for (int aps = 22; aps <= 36; aps++) assertEquals(aps, apsOf(learner(aps, 4)), "aps " + aps);
    }

    // ---------- fit status ----------
    @Test
    void exactlyAtCutoffIsMatchWithZeroMargin() {
        CourseResult r = run(learner(28, 4), generic());
        assertEquals(FitStatus.MATCH, r.fit());
        assertEquals(0, r.apsMargin());
        assertEquals(Label.POSSIBLE, r.label());
        assertEquals(28, r.yourAps());
        assertEquals(28, r.requiredAps());
    }

    @Test
    void oneApsPointShortIsNearMissAndThreeShortIsNoMatch() {
        CourseResult near = run(learner(27, 4), generic());
        assertEquals(FitStatus.NEAR_MISS, near.fit());
        assertEquals(1, near.gapSize());
        assertEquals(Label.UNLIKELY, near.label());
        assertTrue(near.suggestions().get(0).contains("1 point short"), near.suggestions().toString());
        assertEquals(FitStatus.NO_MATCH, run(learner(25, 4), generic()).fit());
        assertEquals(FitStatus.NEAR_MISS, run(learner(26, 4), generic()).fit()); // two short is still within tolerance
    }

    @Test
    void mathsOneLevelShortIsNearMissTwoLevelsShortIsNoMatch() {
        CourseResult near = run(learner(30, 3), generic());
        assertEquals(FitStatus.NEAR_MISS, near.fit());
        assertEquals(1, near.gapSize());
        String s = near.suggestions().get(0);
        assertTrue(s.contains("Level 4 (50% or more) in Mathematics"), s);
        assertTrue(s.contains("You have Level 3 (45%)"), s);
        assertEquals(FitStatus.NO_MATCH, run(learner(30, 2), generic()).fit());
    }

    @Test
    void apsShortAndMathsShortTogetherIsNoMatch() {
        CourseResult r = run(learner(27, 3), generic());
        assertEquals(FitStatus.NO_MATCH, r.fit());
        assertEquals(2, r.reasons().size());
    }

    @Test
    void mathsLiteracyDoesNotSatisfyAMathsRequirement() {
        List<SubjectMark> marks = new ArrayList<>(learner(30, 4));
        marks.removeIf(m -> m.subjectId().equals("MATHS"));
        marks.add(new SubjectMark("MATHS_LIT", 95, true));
        CourseResult r = run(marks, generic());
        assertEquals(FitStatus.NO_MATCH, r.fit());
        assertTrue(r.reasons().get(0).contains("Mathematics"), r.reasons().toString());
        assertTrue(r.reasons().get(0).contains("not in your marks"), r.reasons().toString());
    }

    @Test
    void lifeOrientationAddsNothingToAps() {
        List<SubjectMark> without = learner(28, 4);
        without.removeIf(m -> m.subjectId().equals("LO"));
        assertEquals(run(without, generic()).yourAps(), run(learner(28, 4), generic()).yourAps());
    }

    @Test
    void courseWithNoPublishedApsCannotBeChecked() {
        CourseResult r = run(learner(35, 6), course(null, null, null, "verified"));
        assertEquals(FitStatus.CANNOT_CHECK, r.fit());
        assertNull(r.label());
    }

    @Test
    void unverifiedCourseDataCannotBeChecked() {
        Course c = course(28, null, null, "unverified", new Requirement(1, 1, "MATHS", 4, null, null));
        assertEquals(FitStatus.CANNOT_CHECK, run(learner(35, 6), c).fit());
    }

    @Test
    void customApsMethodCannotBeChecked() {
        Institution custom = new Institution("WITS", "Wits", "CUSTOM", true, false, "https://www.wits.ac.za");
        assertEquals(FitStatus.CANNOT_CHECK, Matcher.evaluate(learner(35, 6), generic(), custom, CFG, NAMES, NOW).fit());
    }

    // ---------- OR groups (UJ BEd Foundation Phase) ----------
    static Course bedFp() {
        return course(28, LocalDate.of(2026, 10, 31), LocalTime.NOON, "verified",
                new Requirement(1, 1, "ENG_HL", 5, null, null), new Requirement(2, 1, "ENG_FAL", 6, null, null),
                new Requirement(3, 2, "MATHS", 3, null, null), new Requirement(4, 2, "MATHS_LIT", 5, null, null),
                new Requirement(5, 2, "TECH_MATHS", 5, null, null));
    }

    @Test
    void orGroupAcceptsAnyAlternative() {
        List<SubjectMark> withLit = new ArrayList<>(learner(30, 4));
        withLit.removeIf(m -> m.subjectId().equals("MATHS"));
        withLit.add(new SubjectMark("MATHS_LIT", pctFor(5), true));
        assertEquals(FitStatus.MATCH, run(withLit, bedFp()).fit());
        assertEquals(FitStatus.MATCH, run(learner(30, 3), bedFp()).fit());   // Maths Level 3 is enough here
    }

    @Test
    void englishFirstAdditionalNeedsLevelSixSoLevelFiveIsNearMiss() {
        List<SubjectMark> marks = new ArrayList<>(learner(30, 4));
        marks.removeIf(m -> m.subjectId().equals("ENG_HL"));
        marks.add(new SubjectMark("ENG_FAL", pctFor(5), true));
        CourseResult r = run(marks, bedFp());
        assertEquals(FitStatus.NEAR_MISS, r.fit());
        assertTrue(r.suggestions().get(0).contains("Level 6 (70% or more) in English First Additional Language"), r.suggestions().toString());
    }

    // ---------- aps_required (UJ LLB, TUT diplomas) ----------
    static Course llb() {
        return course(31, LocalDate.of(2026, 10, 31), LocalTime.NOON, "partial",
                new Requirement(1, 1, "ENG_HL", 5, null, null), new Requirement(2, 1, "ENG_FAL", 5, null, null),
                new Requirement(3, 2, "ADD_LANG", 4, null, null),
                new Requirement(4, 3, "MATHS", 3, 31, null), new Requirement(5, 3, "MATHS_LIT", 4, 32, null));
    }

    static List<SubjectMark> llbLearner(int aps, boolean maths) {
        List<SubjectMark> m = learner(aps, maths ? 4 : 5);
        if (!maths) {
            m.removeIf(x -> x.subjectId().equals("MATHS"));
            m.add(new SubjectMark("MATHS_LIT", pctFor(4), true));
        }
        m.add(new SubjectMark("ADD_LANG", pctFor(4), true));
        return m;
    }

    @Test
    void llbNeedsOneMoreApsPointWithMathsLiteracy() {
        List<SubjectMark> lit = llbLearner(31, false);
        assertTrue(apsOf(lit) >= 31);
        // pin APS exactly: compare against what the learner really has
        int have = Matcher.evaluate(lit, llb(), VERIFIED, CFG, NAMES, NOW).yourAps();
        CourseResult r = Matcher.evaluate(lit, llb(), VERIFIED, CFG, NAMES, NOW);
        assertEquals(32, r.requiredAps());
        assertEquals(have - 32, r.apsMargin());
    }

    @Test
    void llbWithMathsNeeds31() {
        CourseResult r = Matcher.evaluate(llbLearner(31, true), llb(), VERIFIED, CFG, NAMES, NOW);
        assertEquals(31, r.requiredAps());
        assertEquals(FitStatus.MATCH, r.fit());
    }

    static Course tutIt() {
        return course(26, LocalDate.of(2026, 9, 30), null, "verified",
                new Requirement(1, 1, "ENG_HL", 4, null, null), new Requirement(2, 1, "ENG_FAL", 4, null, null),
                new Requirement(3, 2, "MATHS", 5, 26, null), new Requirement(4, 2, "TECH_MATHS", 5, 26, null),
                new Requirement(5, 2, "MATHS_LIT", 7, 28, null),
                new Requirement(6, 3, "PHYS_SCI", 3, null, null), new Requirement(7, 3, "TECH_SCI", 3, null, null));
    }

    static List<SubjectMark> tutLearner(int mathsLevel, String mathsId, int extraLevel) {
        List<SubjectMark> m = new ArrayList<>();
        m.add(new SubjectMark("ENG_HL", pctFor(5), true));
        m.add(new SubjectMark(mathsId, pctFor(mathsLevel), true));
        m.add(new SubjectMark("PHYS_SCI", pctFor(4), true));
        for (int i = 0; i < 3; i++) m.add(new SubjectMark("OTHER" + i, pctFor(extraLevel), true));
        return m;
    }

    @Test
    void tutDiplomaMathsLiteracyRouteNeedsApsTwentyEight() {
        // ML L7 + Eng 5 + Phys 4 + 3 x level 4 = 7+5+4+12 = 28 -> match; 3 x level 3 -> 25 -> short by 3 -> no match
        Course c = tutIt();
        CourseResult ok = Matcher.evaluate(tutLearner(7, "MATHS_LIT", 4), c, TUT, CFG, NAMES, NOW);
        assertEquals(28, ok.requiredAps());
        assertEquals(FitStatus.MATCH, ok.fit());
        assertEquals(FitStatus.NO_MATCH, Matcher.evaluate(tutLearner(7, "MATHS_LIT", 3), c, TUT, CFG, NAMES, NOW).fit());
        CourseResult tm = Matcher.evaluate(tutLearner(5, "TECH_MATHS", 3), c, TUT, CFG, NAMES, NOW); // 5+5+4+9 = 23 vs 26
        assertEquals(26, tm.requiredAps());
    }

    @Test
    void tutDoesNotCountLevelOneSubjects() {
        List<SubjectMark> m = tutLearner(5, "MATHS", 4);
        m.add(new SubjectMark("EXTRA", 10, true));   // level 1
        int withRule = Matcher.evaluate(m, tutIt(), TUT, CFG, NAMES, NOW).yourAps();
        int withoutRule = Matcher.evaluate(m, tutIt(), new Institution("TUT", "T", "ALL_EXCL_LO", true, false, "x"), CFG, NAMES, NOW).yourAps();
        assertEquals(withoutRule - 1, withRule);
    }

    // ---------- deadline ----------
    static DeadlineStatus deadline(LocalDate close, LocalTime time, LocalDateTime now) {
        return Matcher.deadlineStatus(course(28, close, time, "verified"), CFG, now);
    }

    @Test
    void deadlineStatuses() {
        assertEquals(DeadlineStatus.CLOSED, deadline(NOW.toLocalDate().minusDays(1), null, NOW));
        assertEquals(DeadlineStatus.CLOSING_SOON, deadline(NOW.toLocalDate().plusDays(14), null, NOW));
        assertEquals(DeadlineStatus.OPEN, deadline(NOW.toLocalDate().plusDays(15), null, NOW));
        assertEquals(DeadlineStatus.UNKNOWN, deadline(null, null, NOW));
    }

    @Test
    void closingTimeMattersOnTheClosingDay() {
        LocalDate day = LocalDate.of(2026, 10, 31);
        assertEquals(DeadlineStatus.CLOSED, deadline(day, LocalTime.NOON, day.atTime(14, 0)));
        assertEquals(DeadlineStatus.CLOSING_SOON, deadline(day, LocalTime.NOON, day.atTime(11, 0)));
        assertEquals(DeadlineStatus.CLOSING_SOON, deadline(day, null, day.atTime(23, 0))); // no time published: whole day
    }

    @Test
    void missingClosingTimeAddsACaveat() {
        Course c = course(28, LocalDate.of(2026, 10, 31), null, "verified", new Requirement(1, 1, "MATHS", 4, null, null));
        assertTrue(run(learner(30, 4), c).caveats().stream().anyMatch(s -> s.contains("closing time is not published")));
    }

    // ---------- labels and caveats ----------
    @Test
    void labelsFollowTheMargin() {
        assertEquals(Label.LIKELY, run(learner(31, 4), generic()).label());     // margin 3
        assertEquals(Label.POSSIBLE, run(learner(30, 4), generic()).label());   // margin 2
        assertEquals(Label.POSSIBLE, run(learner(28, 4), generic()).label());   // margin 0
        assertEquals(Label.UNLIKELY, run(learner(25, 4), generic()).label());   // no match
    }

    @Test
    void closedCourseKeepsItsLabel() {
        Course closed = course(28, LocalDate.of(2026, 6, 30), null, "verified",
                new Requirement(1, 1, "MATHS", 4, null, null));
        CourseResult r = run(learner(33, 4), closed);
        assertEquals(DeadlineStatus.CLOSED, r.deadline());
        assertEquals(Label.LIKELY, r.label());
    }

    @Test
    void unconfirmedApsMethodAddsACaveatButKeepsTheLabel() {
        CourseResult r = Matcher.evaluate(learner(33, 4), generic(), UNCONFIRMED, CFG, NAMES, NOW);
        assertEquals(Label.LIKELY, r.label());
        assertTrue(r.caveats().stream().anyMatch(s -> s.contains("not yet confirmed")), r.caveats().toString());
    }

    @Test
    void partialSourceAddsACaveat() {
        assertTrue(run(llbLearner(35, true), llb()).caveats().stream().anyMatch(s -> s.contains("still being checked")));
    }

    @Test
    void resultNeverContainsTheLearnersMarksAsText() {
        CourseResult r = run(learner(27, 3), generic());
        String all = String.join(" ", r.suggestions()) + String.join(" ", r.reasons()) + String.join(" ", r.caveats());
        assertFalse(all.contains("OTHER"), all);   // internal subject ids never leak
    }
}
