package com.ukhanyiso.matching;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class ApsCalculator {

    public enum Method {
        BEST6_EXCL_LO,
        ALL_EXCL_LO,
        CUSTOM
    }

    public record SubjectMark(
            String subjectId,
            int percentage,
            boolean countsInAps
    ) {
        public SubjectMark {
            Objects.requireNonNull(subjectId, "subjectId");

            if (subjectId.isBlank()) {
                throw new IllegalArgumentException("Subject ID cannot be blank");
            }
            if (percentage < 0 || percentage > 100) {
                throw new IllegalArgumentException(
                        "Percentage must be between 0 and 100");
            }
        }

        public int level() {
            if (percentage >= 80) return 7;
            if (percentage >= 70) return 6;
            if (percentage >= 60) return 5;
            if (percentage >= 50) return 4;
            if (percentage >= 40) return 3;
            if (percentage >= 30) return 2;
            return 1;
        }
    }

    public record Result(int aps, boolean supported, String message) {}

    private ApsCalculator() {}

    public static Result calculate(
            Method method,
            List<SubjectMark> marks,
            boolean excludeLevelOne
    ) {
        Objects.requireNonNull(method, "method");
        Objects.requireNonNull(marks, "marks");

        if (method == Method.CUSTOM) {
            return new Result(0, false, "CUSTOM APS method is unsupported");
        }

        List<Integer> levels = marks.stream()
                .filter(SubjectMark::countsInAps)
                .filter(mark -> !excludeLevelOne || mark.level() > 1)
                .map(SubjectMark::level)
                .sorted(Comparator.reverseOrder())
                .toList();

        if (method == Method.BEST6_EXCL_LO) {
            levels = levels.stream().limit(6).toList();
        }

        int total = levels.stream().mapToInt(Integer::intValue).sum();

        return new Result(total, true, "APS calculated");
    }
}
