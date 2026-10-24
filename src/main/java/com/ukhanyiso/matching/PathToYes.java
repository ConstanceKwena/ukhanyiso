package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.catalog.Course;
import com.ukhanyiso.matching.catalog.Institution;
import com.ukhanyiso.matching.catalog.MatchConfig;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Path to yes (docs/path-to-yes.md). For a near-miss that is still open, finds the cheapest mark improvements that
 * would make the course a MATCH, by re-running the real matcher on "what if" marks. Rule-based and explainable;
 * it is not machine learning. Pure logic: no database, no web, no clock of its own.
 *
 * Rules, in short: only subjects that count towards APS (never Life Orientation); targets are the lowest mark of a
 * higher level; every suggestion is proven by re-running the matcher; single-subject lifts and pairs of different
 * subjects; rank by percentage points added, then fewer subjects, then subject name; at most two options and the
 * second shares no subject with the first; total of 15 points or less.
 */
public final class PathToYes {
    private PathToYes() {
    }

    /** Most extra percentage points we will ever suggest in total (team decision, docs/path-to-yes.md section 9). */
    public static final int MAX_POINTS = 15;
    public static final int MAX_OPTIONS = 2;

    public record Change(String subject, int fromPercent, int toPercent) {
    }

    public record Option(List<Change> changes, int totalPoints) {
        public Option {
            changes = List.copyOf(changes);
        }
    }

    private record Lift(int index, int target) {
        int cost(List<SubjectMark> marks) {
            return target - marks.get(index).percentage();
        }
    }

    public static List<Option> find(List<SubjectMark> marks, Course course, Institution institution,
                                    MatchConfig config, Map<String, String> subjectNames, LocalDateTime now,
                                    CourseResult base) {
        if (base.fit() != FitStatus.NEAR_MISS || base.deadline() == DeadlineStatus.CLOSED) return List.of();

        // Every possible lift for every subject that counts towards APS and could still go up.
        List<List<Lift>> liftsBySubject = new ArrayList<>();
        for (int i = 0; i < marks.size(); i++) {
            List<Lift> lifts = new ArrayList<>();
            SubjectMark m = marks.get(i);
            if (m.countsInAps()) {
                for (int level = m.level() + 1; level <= 7; level++) {
                    Lift lift = new Lift(i, lowestMarkOf(level));
                    if (lift.cost(marks) <= MAX_POINTS) lifts.add(lift);
                }
            }
            liftsBySubject.add(lifts);
        }

        // Cheapest single lift that works, per subject. A higher lift of the same subject also works.
        Integer[] singleMin = new Integer[marks.size()];
        List<Candidate> candidates = new ArrayList<>();
        for (int i = 0; i < marks.size(); i++) {
            for (Lift lift : liftsBySubject.get(i)) {
                if (works(marks, List.of(lift), course, institution, config, subjectNames, now)) {
                    singleMin[i] = lift.target();
                    candidates.add(candidate(marks, subjectNames, List.of(lift)));
                    break;   // lifts are in ascending order: the first that works is the cheapest
                }
            }
        }

        // Pairs of different subjects. Drop a pair if one of its lifts already works alone.
        for (int i = 0; i < marks.size(); i++) {
            for (int j = i + 1; j < marks.size(); j++) {
                for (Lift a : liftsBySubject.get(i)) {
                    if (singleMin[i] != null && a.target() >= singleMin[i]) continue;
                    for (Lift b : liftsBySubject.get(j)) {
                        if (singleMin[j] != null && b.target() >= singleMin[j]) continue;
                        if (a.cost(marks) + b.cost(marks) > MAX_POINTS) continue;
                        List<Lift> pair = List.of(a, b);
                        if (works(marks, pair, course, institution, config, subjectNames, now)) {
                            candidates.add(candidate(marks, subjectNames, pair));
                        }
                    }
                }
            }
        }

        candidates.sort(Comparator
                .comparingInt((Candidate c) -> c.option.totalPoints())
                .thenComparingInt(c -> c.option.changes().size())
                .thenComparing(c -> c.sortKey));

        List<Option> chosen = new ArrayList<>();
        Set<String> used = new HashSet<>();
        for (Candidate c : candidates) {
            if (chosen.size() == MAX_OPTIONS) break;
            boolean overlaps = c.option.changes().stream().anyMatch(ch -> used.contains(ch.subject()));
            if (!chosen.isEmpty() && overlaps) continue;   // second option must use different subjects
            chosen.add(c.option);
            c.option.changes().forEach(ch -> used.add(ch.subject()));
        }
        return chosen;
    }

    // ------------------------------------------------------------------ helpers

    private record Candidate(Option option, String sortKey) {
    }

    private static Candidate candidate(List<SubjectMark> marks, Map<String, String> names, List<Lift> lifts) {
        List<Change> changes = new ArrayList<>();
        int total = 0;
        for (Lift l : lifts) {
            SubjectMark m = marks.get(l.index());
            changes.add(new Change(names.getOrDefault(m.subjectId(), m.subjectId()), m.percentage(), l.target()));
            total += l.target() - m.percentage();
        }
        changes.sort(Comparator.comparing(Change::subject));
        StringBuilder key = new StringBuilder();
        changes.forEach(c -> key.append(c.subject()).append('|'));
        return new Candidate(new Option(changes, total), key.toString());
    }

    /** Re-runs the real matcher with the lifted marks. A suggestion is only ever shown if this is a MATCH. */
    private static boolean works(List<SubjectMark> marks, List<Lift> lifts, Course course, Institution institution,
                                 MatchConfig config, Map<String, String> names, LocalDateTime now) {
        List<SubjectMark> changed = new ArrayList<>(marks);
        for (Lift l : lifts) {
            SubjectMark m = changed.get(l.index());
            changed.set(l.index(), new SubjectMark(m.subjectId(), l.target(), m.countsInAps()));
        }
        return Matcher.evaluate(changed, course, institution, config, names, now).fit() == FitStatus.MATCH;
    }

    /** Lowest percentage of a level: 2 = 30, 3 = 40, 4 = 50, 5 = 60, 6 = 70, 7 = 80. */
    static int lowestMarkOf(int level) {
        return 30 + (level - 2) * 10;
    }
}
