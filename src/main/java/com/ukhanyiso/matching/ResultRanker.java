package com.ukhanyiso.matching;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/** docs/matching-rules.md section 7. */
public final class ResultRanker {
    private ResultRanker() {
    }

    /**
     * 1 MATCH + CLOSING_SOON (soonest first)   2 MATCH + OPEN/UNKNOWN (Likely before Possible)
     * 3 NEAR_MISS still open (smallest gap first)   4 MATCH but CLOSED   5 NEAR_MISS but CLOSED   6 everything else
     */
    public static List<CourseResult> rank(List<CourseResult> results) {
        return results.stream().sorted(COMPARATOR).toList();
    }

    static int bucket(CourseResult r) {
        boolean closed = r.deadline() == DeadlineStatus.CLOSED;
        return switch (r.fit()) {
            case MATCH -> closed ? 4 : (r.deadline() == DeadlineStatus.CLOSING_SOON ? 1 : 2);
            case NEAR_MISS -> closed ? 5 : 3;
            default -> 6;
        };
    }

    private static final Comparator<CourseResult> COMPARATOR = Comparator
            .comparingInt(ResultRanker::bucket)
            .thenComparing((CourseResult r) -> r.label() == null ? 9 : r.label().ordinal())
            .thenComparing((CourseResult r) -> r.gapSize() == null ? 0 : r.gapSize())
            .thenComparing((CourseResult r) -> r.closingDate() == null ? LocalDate.MAX : r.closingDate())
            .thenComparing(CourseResult::institution)
            .thenComparing(CourseResult::course);
}
