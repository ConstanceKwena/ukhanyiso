package com.ukhanyiso.matching;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * One course's answer for one learner. This is also the JSON shape the front end receives.
 * The field names are the JSON contract with the front end (see docs/api-contract.md).
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
        List<String> caveats,        // things the learner should double-check
        List<PathToYes.Option> pathToYes) {   // NEAR_MISS and open only: cheapest mark improvements that would meet the minimum

    /** Same as before the path-to-yes feature: no path attached. Keeps every existing caller and test unchanged. */
    public CourseResult(String courseId, String course, String institutionId, String institution, String qualification,
                        FitStatus fit, DeadlineStatus deadline, Label label, Integer requiredAps, Integer yourAps,
                        Integer apsMargin, Integer gapSize, LocalDate closingDate, LocalTime closingTime,
                        String officialLink, LocalDate sourceChecked, List<String> suggestions, List<String> reasons,
                        List<String> caveats) {
        this(courseId, course, institutionId, institution, qualification, fit, deadline, label, requiredAps, yourAps,
                apsMargin, gapSize, closingDate, closingTime, officialLink, sourceChecked, suggestions, reasons,
                caveats, List.of());
    }

    public CourseResult withPathToYes(List<PathToYes.Option> path) {
        return new CourseResult(courseId, course, institutionId, institution, qualification, fit, deadline, label,
                requiredAps, yourAps, apsMargin, gapSize, closingDate, closingTime, officialLink, sourceChecked,
                suggestions, reasons, caveats, path);
    }

    public CourseResult {
        suggestions = List.copyOf(suggestions);
        reasons = List.copyOf(reasons);
        caveats = List.copyOf(caveats);
        pathToYes = List.copyOf(pathToYes);
    }
}
