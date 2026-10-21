package com.ukhanyiso.matching.catalog;

import java.util.List;
import java.util.Map;

/** Everything the matcher needs, loaded in one go. */
public record Catalog(
        List<Course> courses,
        Map<String, Institution> institutions,
        MatchConfig config,
        Map<String, String> subjectNames) {
}
