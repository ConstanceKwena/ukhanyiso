package com.ukhanyiso.bursary;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Response of GET /api/bursaries. */
public record BursaryResponse(List<Item> bursaries, String disclaimer) {
    public record Item(
            String id,
            String name,
            String type,
            LocalDate closingDate,
            LocalTime closingTime,
            String deadline,
            String whoItsFor,
            List<String> documents,
            String officialLink,
            String status,
            String notes
    ) { }
}
