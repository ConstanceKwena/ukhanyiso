package com.ukhanyiso.matching.catalog;

/** Tunable settings from the match_config table (docs/matching-rules.md sections 5, 6 and 9). */
public record MatchConfig(
        int apsTolerance,
        int levelTolerance,
        int maxGapsForNear,
        int closingSoonDays,
        int likelyApsMargin) {

    public static MatchConfig defaults() {
        return new MatchConfig(2, 1, 1, 14, 3);
    }
}
