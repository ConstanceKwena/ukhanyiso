package com.ukhanyiso.matching;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ApsCalculatorTest {

    @Test
    void convertsPercentagesToCorrectLevels() {
        assertEquals(7, new ApsCalculator.SubjectMark("A", 80, true).level());
        assertEquals(6, new ApsCalculator.SubjectMark("B", 70, true).level());
        assertEquals(5, new ApsCalculator.SubjectMark("C", 60, true).level());
        assertEquals(4, new ApsCalculator.SubjectMark("D", 50, true).level());
        assertEquals(3, new ApsCalculator.SubjectMark("E", 40, true).level());
        assertEquals(2, new ApsCalculator.SubjectMark("F", 30, true).level());
        assertEquals(1, new ApsCalculator.SubjectMark("G", 29, true).level());
    }

    @Test
    void bestSixMethodAddsOnlySixHighestLevels() {
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
    void allSubjectsMethodIncludesEveryEligibleSubject() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("A", 80, true),
                new ApsCalculator.SubjectMark("B", 70, true),
                new ApsCalculator.SubjectMark("C", 60, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.ALL_EXCL_LO, marks, false);

        assertEquals(18, result.aps());
    }

    @Test
    void excludesSubjectsThatDoNotCountInAps() {
        var marks = List.of(
                new ApsCalculator.SubjectMark("LO", 100, false),
                new ApsCalculator.SubjectMark("MATHS", 80, true)
        );

        var result = ApsCalculator.calculate(
                ApsCalculator.Method.ALL_EXCL_LO, marks, false);

        assertEquals(7, result.aps());
    }

    @Test
    void customMethodReturnsUnsupportedResult() {
        var result = ApsCalculator.calculate(
                ApsCalculator.Method.CUSTOM, List.of(), false);

        assertFalse(result.supported());
        assertEquals(0, result.aps());
    }

    @Test
    void rejectsPercentagesOutsideZeroToOneHundred() {
        assertThrows(IllegalArgumentException.class,
                () -> new ApsCalculator.SubjectMark("A", 101, true));

        assertThrows(IllegalArgumentException.class,
                () -> new ApsCalculator.SubjectMark("A", -1, true));
    }
}