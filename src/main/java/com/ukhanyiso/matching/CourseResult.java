package com.ukhanyiso.matching;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * One course's answer for one learner. This is also the JSON shape the front end receives.
 * requiredAps / yourAps / label / closingDate use the same names as FAKE_RESULTS in static/js/fake-data.js.
 */
public record CourseResult(
        String courseId,
        String course,
        String institutionId,
        String institution,
        String qualification,
        FitStatus fit,
        DeadlineStatus deadline,
        Label label,                 // null when fit is CANNOT_CHECK
        Integer requiredAps,
        Integer yourAps,
        Integer apsMargin,           // yourAps - requiredAps (negative = short)
        Integer gapSize,             // NEAR_MISS only: APS points short, or levels short in one subject
        LocalDate closingDate,
        LocalTime closingTime,
        String officialLink,
        LocalDate sourceChecked,
        List<String> suggestions,    // NEAR_MISS: what would close the gap, in plain words
        List<String> reasons,        // NO_MATCH: why the course does not fit
        List<String> caveats) {      // things the learner should double-check

    public CourseResult {
        suggestions = List.copyOf(suggestions);
        reasons = List.copyOf(reasons);
        caveats = List.copyOf(caveats);
    }
}
