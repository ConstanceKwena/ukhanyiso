package com.ukhanyiso.bursary;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
        String notes,
        LocalDate lastChecked
) {
    public Bursary {
        documents = documents == null ? List.of() : List.copyOf(documents);
    }

    public Bursary(
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
        this(id, name, type, closingDate, closingTime, whoItsFor,
                documents, officialLink, status, notes, null);
    }
}