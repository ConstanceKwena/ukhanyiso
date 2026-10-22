package com.ukhanyiso.bursary;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** One bursary as stored in bursaries.json. Read-only data: nothing here comes from a learner. */
public record Bursary(
        String id,
        String name,
        String type,
        LocalDate closingDate,
        LocalTime closingTime,
        String whoItsFor,
        List<String> documents,
        String officialLink,
        String status,
        String notes
) {
    public Bursary {
        documents = documents == null ? List.of() : List.copyOf(documents);
    }
}
