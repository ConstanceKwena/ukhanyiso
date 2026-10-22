package com.ukhanyiso.matching.catalog;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record Course(
        String courseId,
        String institutionId,
        String name,
        String qualification,
        Integer minAps,              // null = not published -> CANNOT_CHECK
        LocalDate closingDate,       // null = unknown
        LocalTime closingTime,       // null = no time published
        String courseUrl,            // official programme page
        String sourceStatus,         // verified | partial | unverified | conflicting | stale
        LocalDate sourceChecked,     // date_checked of the source row
        List<Requirement> requirements) {

    public Course {
        requirements = List.copyOf(requirements);
    }
}
