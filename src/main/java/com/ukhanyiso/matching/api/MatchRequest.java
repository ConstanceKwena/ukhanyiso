package com.ukhanyiso.matching.api;

import java.util.List;

/**
 * Body of POST /api/match:  {"marks":[{"subject":"Mathematics","mark":62}, ...]}
 * mark may be a JSON whole number or a string of digits (the form sends text). Unknown fields are rejected
 * (spring.jackson.deserialization.fail-on-unknown-properties=true in application.properties).
 */
public record MatchRequest(List<MarkEntry> marks) {

    public record MarkEntry(String subject, Object mark) {
    }
}
