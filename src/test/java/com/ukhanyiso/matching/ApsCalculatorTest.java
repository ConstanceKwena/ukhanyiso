package com.ukhanyiso.matching;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ApsCalculatorTest {

    @Test
    void convertsEveryPercentageBandBoundaryToTheCorrectLevel() {
        assertAll(
                () -> assertEquals(1, level(0)),
                () -> assertEquals(1, level(29)),
                () -> assertEquals(2, level(30)),
                () -> assertEquals(2, level(39)),
                () -> assertEquals(3, level(40)),
                () -> assertEquals(3, level(49)),
                () -> assertEquals(4, level(50)),
                () -> assertEquals(4, level(59)),
                () -> assertEquals(5, level(60)),
                () -> assertEquals(5, level(69)),
                () -> assertEquals(6, level(70)),
                () -> assertEquals(6, level(79)),
                () -> assertEquals(7, level(80)),
                () -> assertEquals(7, level(100))
        );
    }

    @Test
    void bestSixMethodAddsOnlySixHighestEligibleLevels() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("A", 90, true),
                new ApsCalculator.SubjectMark("B", 80, true),
                new ApsCalculator.SubjectMark("C", 70, true),
                new ApsCalculator.SubjectMark("D", 60, true),
                new ApsCalculator.SubjectMark("E", 50, true),
                new ApsCalculator.SubjectMark("F", 40, true),
                new ApsCalculator.SubjectMark("G", 30, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.BEST6_EXCL_LO, marks, false);

        assertTrue(result.supported());
        assertEquals(32, result.aps());
    }

    @Test
    void allSubjectsMethodIncludesEveryEligibleSubjectEvenWhenThereAreMoreThanSix() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("A", 80, true),
                new ApsCalculator.SubjectMark("B", 70, true),
                new ApsCalculator.SubjectMark("C", 60, true),
                new ApsCalculator.SubjectMark("D", 50, true),
                new ApsCalculator.SubjectMark("E", 40, true),
                new ApsCalculator.SubjectMark("F", 30, true),
                new ApsCalculator.SubjectMark("G", 0, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.ALL_EXCL_LO, marks, false);

        assertEquals(28, result.aps());
    }

    @Test
    void excludesLifeOrientationWhenCallerMarksItAsNotCounting() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("LO", 100, false),
                new ApsCalculator.SubjectMark("MATHS", 80, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.ALL_EXCL_LO, marks, false);

        assertEquals(7, result.aps());
    }

    @Test
    void excludesLevelOneMarksWhenInstitutionRequiresIt() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("A", 29, true),
                new ApsCalculator.SubjectMark("B", 30, true),
                new ApsCalculator.SubjectMark("C", 80, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.ALL_EXCL_LO, marks, true);

        assertTrue(result.supported());
        assertEquals(9, result.aps());
    }

    @Test
    void bestSixUsesAllAvailableMarksWhenFewerThanSixAreEligible() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("LO", 100, false),
                new ApsCalculator.SubjectMark("A", 80, true),
                new ApsCalculator.SubjectMark("B", 70, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.BEST6_EXCL_LO, marks, false);

        assertTrue(result.supported());
        assertEquals(13, result.aps());
    }

    @Test
    void customMethodReturnsUnsupportedResult() {
        var result = ApsCalculator.calculate(
                ApsCalculator.Method.CUSTOM, List.of(), false);

        assertFalse(result.supported());
        assertEquals(0, result.aps());
        assertEquals("CUSTOM APS method is unsupported", result.message());
    }

    @Test
    void rejectsPercentagesOutsideZeroToOneHundred() {
        assertThrows(IllegalArgumentException.class,
                () -> new ApsCalculator.SubjectMark("A", 101, true));

        assertThrows(IllegalArgumentException.class,
                () -> new ApsCalculator.SubjectMark("A", -1, true));
    }

    @Test
    void rejectsNullAndBlankSubjectIds() {
        assertThrows(NullPointerException.class,
                () -> new ApsCalculator.SubjectMark(null, 50, true));
        assertThrows(IllegalArgumentException.class,
                () -> new ApsCalculator.SubjectMark(" ", 50, true));
    }

    @Test
    void rejectsNullMethodAndMarksList() {
        assertThrows(NullPointerException.class,
                () -> ApsCalculator.calculate(null, List.of(), false));
        assertThrows(NullPointerException.class,
                () -> ApsCalculator.calculate(ApsCalculator.Method.ALL_EXCL_LO, null, false));
    }

    private static int level(int percentage) {
        return new ApsCalculator.SubjectMark("SUBJECT", percentage, true).level();
    }
}