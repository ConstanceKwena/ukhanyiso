package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.api.MatchRequest.MarkEntry;
import com.ukhanyiso.matching.catalog.SubjectCatalog;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Server-side version of validateMarks / validateCombos in static/js/validate.js. The browser check is only for
 * convenience; this is the one that counts. Messages match docs/test-cases-validation.md (V-01 to V-12).
 */
public final class MarksValidator {
    private MarksValidator() {
    }

    public static final int MAX_SUBJECTS = 12;
    private static final Pattern DIGITS = Pattern.compile("\\d{1,3}");

    public static final String EMPTY = "Please fill in all required fields.";
    public static final String UNKNOWN_SUBJECT = "Please choose a subject from the list.";
    public static final String DUPLICATE = "Each subject can only be added once.";
    public static final String RANGE = "Marks must be between 0 and 100.";
    public static final String CONFLICT = "Some of these subjects can't be taken together.";
    public static final String LANG_ONCE = "A language can only be added once, at one level.";
    public static final String LANG_GROUP = "Some of these languages can't be taken together.";
    public static final String NONE_GIVEN = "Please add at least one subject.";
    public static final String TOO_MANY = "Please add no more than " + MAX_SUBJECTS + " subjects.";

    /** Returns the cleaned marks, or throws InvalidMarksException listing every problem found. */
    public static List<SubjectMark> validate(MatchRequest request) {
        if (request == null || request.marks() == null || request.marks().isEmpty()) {
            throw new InvalidMarksException(List.of(NONE_GIVEN));
        }
        if (request.marks().size() > MAX_SUBJECTS) {
            throw new InvalidMarksException(List.of(TOO_MANY));
        }

        Set<String> errors = new LinkedHashSet<>();
        Set<String> seen = new HashSet<>();
        List<String> chosen = new ArrayList<>();
        List<SubjectMark> out = new ArrayList<>();

        for (MarkEntry e : request.marks()) {
            if (e == null || e.subject() == null || e.subject().isEmpty() || isBlank(e.mark())) {
                errors.add(EMPTY);
                continue;
            }
            boolean known = SubjectCatalog.isKnown(e.subject());
            if (!known) {
                errors.add(UNKNOWN_SUBJECT);
            } else if (!seen.add(e.subject())) {
                errors.add(DUPLICATE);
            } else {
                chosen.add(e.subject());
            }
            Integer pct = wholeNumber(e.mark());
            if (pct == null || pct < 0 || pct > 100) {
                errors.add(RANGE);
            } else if (known && errors.isEmpty()) {
                out.add(new SubjectMark(SubjectCatalog.idFor(e.subject()), pct, SubjectCatalog.countsInAps(e.subject())));
            }
        }

        errors.addAll(combinationErrors(chosen));
        if (!errors.isEmpty()) throw new InvalidMarksException(new ArrayList<>(errors));
        return out;
    }

    static List<String> combinationErrors(List<String> chosen) {
        List<String> errors = new ArrayList<>();
        for (Set<String> pair : SubjectCatalog.CONFLICTS) {
            if (chosen.containsAll(pair)) {
                errors.add(CONFLICT);
                break;
            }
        }
        List<String> langs = chosen.stream().filter(SubjectCatalog::isLanguage).map(SubjectCatalog::languageOf).toList();
        if (new HashSet<>(langs).size() != langs.size()) errors.add(LANG_ONCE);
        for (Set<String> group : SubjectCatalog.LANG_GROUPS) {
            if (langs.stream().filter(group::contains).count() > 1) {
                errors.add(LANG_GROUP);
                break;
            }
        }
        return errors;
    }

    private static boolean isBlank(Object mark) {
        return mark == null || (mark instanceof String s && s.isBlank());
    }

    /** A whole number from a JSON integer or a plain digit string; anything else (70.5, "7e1", "abc", NaN) is null. */
    private static Integer wholeNumber(Object mark) {
        if (mark instanceof Integer || mark instanceof Long || mark instanceof Short || mark instanceof Byte) {
            long v = ((Number) mark).longValue();
            return (v < Integer.MIN_VALUE || v > Integer.MAX_VALUE) ? null : (int) v;
        }
        if (mark instanceof String s && DIGITS.matcher(s).matches()) return Integer.parseInt(s);
        return null;
    }
}
