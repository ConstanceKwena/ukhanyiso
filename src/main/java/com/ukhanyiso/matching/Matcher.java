package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.catalog.Course;
import com.ukhanyiso.matching.catalog.Institution;
import com.ukhanyiso.matching.catalog.MatchConfig;
import com.ukhanyiso.matching.catalog.Requirement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalInt;

/**
 * Implements docs/matching-rules.md: hard rules (section 4), near-miss rule (5), deadline status (6), label (9).
 * Pure logic: no database, no web, no clock of its own (now is passed in).
 */
public final class Matcher {
    private Matcher() {
    }

    /** One group of alternative subjects ("any one of these") and how the learner stands against it. */
    private record GroupOutcome(int groupId, List<Requirement> alternatives, boolean satisfied, boolean missing,
                                int shortfallLevels, Requirement nearest, int learnerLevel, int learnerPercent,
                                int apsNeeded) {
    }

    public static CourseResult evaluate(List<SubjectMark> marks, Course course, Institution institution,
                                        MatchConfig cfg, Map<String, String> subjectNames, LocalDateTime now) {
        DeadlineStatus deadline = deadlineStatus(course, cfg, now);
        List<String> caveats = new ArrayList<>();
        if (!institution.apsMethodVerified()) {
            caveats.add("How " + institution.name() + " adds up your APS is not yet confirmed from an official page.");
        }
        if ("partial".equals(course.sourceStatus())) {
            caveats.add("Some details for this course are still being checked. Confirm with the institution.");
        }
        if (course.closingDate() != null && course.closingTime() == null) {
            caveats.add("The closing time is not published. Apply early.");
        }

        // ---- CANNOT_CHECK: data not good enough to judge ----
        boolean sourceOk = "verified".equals(course.sourceStatus()) || "partial".equals(course.sourceStatus());
        ApsCalculator.Method method = parseMethod(institution.apsMethod());
        boolean noAps = method == ApsCalculator.Method.NO_APS;
        if (course.minAps() == null && !noAps || !sourceOk || method == null || method == ApsCalculator.Method.CUSTOM) {
            return build(course, institution, FitStatus.CANNOT_CHECK, deadline, null, course.minAps(), null, null, null,
                    List.of(), List.of("We can't check this course yet because its requirements are not fully confirmed."),
                    caveats);
        }

        int aps = ApsCalculator.calculate(method, marks, institution.excludeLevelOne()).aps();
        if (noAps) {
            // TVET courses: judge only on subject groups; APS is not part of admission.
            List<String> noApsReasons = new ArrayList<>();
            int gaps = 0;
            for (Map.Entry<Integer, List<Requirement>> e : groupBy(course)) {
                GroupOutcome g = evaluateGroup(e.getKey(), e.getValue(), marks, 0);
                if (!g.satisfied()) {
                    gaps++;
                    if (g.missing()) {
                        noApsReasons.add("This course needs " + alternativesText(g, subjectNames) + ". It is not in your marks.");
                    } else {
                        noApsReasons.add("You need " + needText(g, subjectNames) + ". You have Level " + g.learnerLevel()
                                + " (" + g.learnerPercent() + "%).");
                    }
                }
            }
            FitStatus noApsFit = gaps == 0 ? FitStatus.MATCH
                    : gaps <= cfg.maxGapsForNear() ? FitStatus.NEAR_MISS : FitStatus.NO_MATCH;
            Label noApsLabel = noApsFit == FitStatus.MATCH ? Label.POSSIBLE : Label.UNLIKELY;
            return build(course, institution, noApsFit, deadline, noApsLabel, null, null, null, null,
                    List.of(), noApsReasons, caveats);
        }

        // ---- subject groups ----
        Map<Integer, List<Requirement>> byGroup = new LinkedHashMap<>();
        for (Requirement r : course.requirements()) {
            byGroup.computeIfAbsent(r.groupId(), k -> new ArrayList<>()).add(r);
        }
        List<GroupOutcome> groups = new ArrayList<>();
        int apsNeeded = course.minAps();
        for (Map.Entry<Integer, List<Requirement>> e : byGroup.entrySet()) {
            GroupOutcome g = evaluateGroup(e.getKey(), e.getValue(), marks, course.minAps());
            groups.add(g);
            if (!g.missing()) apsNeeded = Math.max(apsNeeded, g.apsNeeded());
        }

        int apsShort = apsNeeded - aps;
        boolean hardFail = apsShort > cfg.apsTolerance();
        int gaps = apsShort > 0 ? 1 : 0;
        for (GroupOutcome g : groups) {
            if (g.satisfied()) continue;
            if (g.missing() || g.shortfallLevels() > cfg.levelTolerance()) hardFail = true;
            else gaps++;
        }

        FitStatus fit;
        if (!hardFail && gaps == 0) fit = FitStatus.MATCH;
        else if (!hardFail && gaps <= cfg.maxGapsForNear()) fit = FitStatus.NEAR_MISS;
        else fit = FitStatus.NO_MATCH;

        int margin = aps - apsNeeded;
        Label label = switch (fit) {
            case MATCH -> margin >= cfg.likelyApsMargin() ? Label.LIKELY : Label.POSSIBLE;
            case NEAR_MISS, NO_MATCH -> Label.UNLIKELY;
            case CANNOT_CHECK -> null;
        };

        List<String> suggestions = new ArrayList<>();
        List<String> reasons = new ArrayList<>();
        Integer gapSize = null;
        if (fit == FitStatus.NEAR_MISS) {
            if (apsShort > 0) {
                gapSize = apsShort;
                suggestions.add("Your APS is " + aps + " and this course needs " + apsNeeded + ". You are "
                        + points(apsShort) + " short. Moving one subject up one level adds one point.");
            }
            for (GroupOutcome g : groups) {
                if (!g.satisfied()) {
                    gapSize = g.shortfallLevels();
                    suggestions.add("You need " + needText(g, subjectNames) + ". You have Level " + g.learnerLevel()
                            + " (" + g.learnerPercent() + "%).");
                }
            }
        } else if (fit == FitStatus.NO_MATCH) {
            for (GroupOutcome g : groups) {
                if (g.satisfied()) continue;
                if (g.missing()) {
                    reasons.add("This course needs " + alternativesText(g, subjectNames) + ". It is not in your marks.");
                } else {
                    reasons.add("You need " + needText(g, subjectNames) + ". You have Level " + g.learnerLevel() + ".");
                }
            }
            if (apsShort > 0) {
                reasons.add("Your APS is " + aps + " and this course needs " + apsNeeded + ".");
            }
        }

        return build(course, institution, fit, deadline, label, apsNeeded, aps, margin, gapSize, suggestions, reasons, caveats);
    }

    private static List<Map.Entry<Integer, List<Requirement>>> groupBy(Course course) {
        Map<Integer, List<Requirement>> byGroup = new LinkedHashMap<>();
        for (Requirement r : course.requirements()) {
            byGroup.computeIfAbsent(r.groupId(), k -> new ArrayList<>()).add(r);
        }
        return new ArrayList<>(byGroup.entrySet());
    }

    // ------------------------------------------------------------------ groups

    private static GroupOutcome evaluateGroup(int groupId, List<Requirement> alts, List<SubjectMark> marks, int courseAps) {
        boolean anyPresent = false;
        Integer bestOkAps = null;          // lowest APS among alternatives the learner satisfies
        Requirement nearest = null;        // present alternative with the smallest shortfall
        int nearestShort = Integer.MAX_VALUE;
        int nearestLevel = 0;
        int nearestPercent = 0;
        int nearestAps = Integer.MAX_VALUE;

        for (Requirement alt : alts) {
            OptionalInt pct = percentOf(marks, alt.subjectId());
            if (pct.isEmpty()) continue;
            anyPresent = true;
            int level = levelOf(pct.getAsInt());
            int needLevel = needLevel(alt);
            boolean ok = alt.minPercent() != null ? pct.getAsInt() >= alt.minPercent() : level >= alt.minLevel();
            int apsForAlt = alt.apsRequired() != null ? alt.apsRequired() : courseAps;
            if (ok) {
                if (bestOkAps == null || apsForAlt < bestOkAps) bestOkAps = apsForAlt;
            } else {
                int shortfall = Math.max(1, needLevel - level);
                if (shortfall < nearestShort || (shortfall == nearestShort && apsForAlt < nearestAps)) {
                    nearest = alt;
                    nearestShort = shortfall;
                    nearestLevel = level;
                    nearestPercent = pct.getAsInt();
                    nearestAps = apsForAlt;
                }
            }
        }

        if (bestOkAps != null) {
            return new GroupOutcome(groupId, alts, true, false, 0, null, 0, 0, bestOkAps);
        }
        if (!anyPresent) {
            return new GroupOutcome(groupId, alts, false, true, Integer.MAX_VALUE, null, 0, 0, courseAps);
        }
        return new GroupOutcome(groupId, alts, false, false, nearestShort, nearest, nearestLevel, nearestPercent, nearestAps);
    }

    private static OptionalInt percentOf(List<SubjectMark> marks, String subjectId) {
        int best = -1;   // ADD_LANG can appear more than once: use the learner's best one
        for (SubjectMark m : marks) {
            if (m.subjectId().equals(subjectId) && m.percentage() > best) best = m.percentage();
        }
        return best < 0 ? OptionalInt.empty() : OptionalInt.of(best);
    }

    // ------------------------------------------------------------------ deadline

    static DeadlineStatus deadlineStatus(Course course, MatchConfig cfg, LocalDateTime now) {
        LocalDate date = course.closingDate();
        if (date == null) return DeadlineStatus.UNKNOWN;
        LocalTime time = course.closingTime() != null ? course.closingTime() : LocalTime.of(23, 59, 59);
        if (now.isAfter(LocalDateTime.of(date, time))) return DeadlineStatus.CLOSED;
        long days = ChronoUnit.DAYS.between(now.toLocalDate(), date);
        return days <= cfg.closingSoonDays() ? DeadlineStatus.CLOSING_SOON : DeadlineStatus.OPEN;
    }

    // ------------------------------------------------------------------ helpers

    private static ApsCalculator.Method parseMethod(String s) {
        try {
            return ApsCalculator.Method.valueOf(s);
        } catch (IllegalArgumentException | NullPointerException e) {
            return null;
        }
    }

    static int levelOf(int percent) {
        return new SubjectMark("X", percent, true).level();
    }

    private static int needLevel(Requirement r) {
        return r.minPercent() != null ? levelOf(r.minPercent()) : r.minLevel();
    }

    /** Lowest percentage that reaches a level. */
    static int minPercentFor(int level) {
        return switch (level) {
            case 7 -> 80;
            case 6 -> 70;
            case 5 -> 60;
            case 4 -> 50;
            case 3 -> 40;
            case 2 -> 30;
            default -> 0;
        };
    }

    private static String nameOf(String subjectId, Map<String, String> names) {
        if (subjectId.equals("ADD_LANG")) return "an additional language";
        return names.getOrDefault(subjectId, subjectId);
    }

    private static String needText(GroupOutcome g, Map<String, String> names) {
        Requirement r = g.nearest();
        int pct = r.minPercent() != null ? r.minPercent() : minPercentFor(r.minLevel());
        return "Level " + needLevel(r) + " (" + pct + "% or more) in " + nameOf(r.subjectId(), names);
    }

    private static String alternativesText(GroupOutcome g, Map<String, String> names) {
        List<String> parts = new ArrayList<>();
        for (Requirement r : g.alternatives()) {
            parts.add(nameOf(r.subjectId(), names) + " at Level " + needLevel(r) + " or higher");
        }
        return parts.size() == 1 ? parts.get(0) : "one of: " + String.join("; ", parts);
    }

    private static String points(int n) {
        return n + (n == 1 ? " point" : " points");
    }

    private static CourseResult build(Course c, Institution i, FitStatus fit, DeadlineStatus deadline, Label label,
                                      Integer requiredAps, Integer yourAps, Integer margin, Integer gapSize,
                                      List<String> suggestions, List<String> reasons, List<String> caveats) {
        return new CourseResult(c.courseId(), c.name(), i.institutionId(), i.name(), c.qualification(), fit, deadline,
                label, requiredAps, yourAps, margin, gapSize, c.closingDate(), c.closingTime(), c.courseUrl(),
                c.sourceChecked(), suggestions, reasons, caveats);
    }
}
