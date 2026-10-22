package com.ukhanyiso.matching;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ResultRankerTest {

    static CourseResult r(String name, FitStatus fit, DeadlineStatus d, Label label, Integer gap, LocalDate close) {
        return new CourseResult(name, name, "UJ", "Inst", "bachelor", fit, d, label, 28, 28, 0, gap, close, null,
                "https://www.uj.ac.za", LocalDate.of(2026, 10, 16), List.of(), List.of(), List.of());
    }

    @Test
    void ordersByTheBucketsInTheRulesDocument() {
        var closedMatch = r("closedMatch", FitStatus.MATCH, DeadlineStatus.CLOSED, Label.LIKELY, null, LocalDate.of(2026, 6, 30));
        var near2 = r("near2", FitStatus.NEAR_MISS, DeadlineStatus.OPEN, Label.UNLIKELY, 2, LocalDate.of(2026, 11, 30));
        var near1 = r("near1", FitStatus.NEAR_MISS, DeadlineStatus.OPEN, Label.UNLIKELY, 1, LocalDate.of(2026, 12, 1));
        var openPossible = r("openPossible", FitStatus.MATCH, DeadlineStatus.OPEN, Label.POSSIBLE, null, LocalDate.of(2026, 11, 1));
        var openLikely = r("openLikely", FitStatus.MATCH, DeadlineStatus.OPEN, Label.LIKELY, null, LocalDate.of(2026, 12, 1));
        var soonLate = r("soonLate", FitStatus.MATCH, DeadlineStatus.CLOSING_SOON, Label.POSSIBLE, null, LocalDate.of(2026, 10, 31));
        var soonEarly = r("soonEarly", FitStatus.MATCH, DeadlineStatus.CLOSING_SOON, Label.LIKELY, null, LocalDate.of(2026, 10, 25));
        var closedNear = r("closedNear", FitStatus.NEAR_MISS, DeadlineStatus.CLOSED, Label.UNLIKELY, 1, LocalDate.of(2026, 6, 30));
        var no = r("no", FitStatus.NO_MATCH, DeadlineStatus.OPEN, Label.UNLIKELY, null, null);

        var ranked = ResultRanker.rank(List.of(no, closedNear, closedMatch, near2, near1, openPossible, openLikely, soonLate, soonEarly));
        assertEquals(List.of("soonEarly", "soonLate", "openLikely", "openPossible", "near1", "near2", "closedMatch", "closedNear", "no"),
                ranked.stream().map(CourseResult::courseId).toList());
    }
}
