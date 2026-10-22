package com.ukhanyiso.matching;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.catalog.Catalog;
import com.ukhanyiso.matching.catalog.CatalogRepository;
import com.ukhanyiso.matching.catalog.Institution;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads the catalog, evaluates every course for the learner and ranks the results.
 * Read-only: the learner's marks are used in memory and are never stored or logged (they are personal data).
 */
@Service
public class CourseMatchService {

    private final CatalogRepository repository;
    private final Clock clock;

    public CourseMatchService(CatalogRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    /** marks must come from MarksValidator. includeAll=false hides NO_MATCH and CANNOT_CHECK courses. */
    public List<CourseResult> match(List<SubjectMark> marks, boolean includeAll) {
        Catalog catalog = repository.load();
        LocalDateTime now = LocalDateTime.now(clock);
        List<CourseResult> results = new ArrayList<>();
        for (var course : catalog.courses()) {
            Institution institution = catalog.institutions().get(course.institutionId());
            if (institution == null) continue;   // cannot happen with the foreign key; skip rather than guess
            CourseResult r = Matcher.evaluate(marks, course, institution, catalog.config(), catalog.subjectNames(), now);
            if (includeAll || r.fit() == FitStatus.MATCH || r.fit() == FitStatus.NEAR_MISS) results.add(r);
        }
        return ResultRanker.rank(results);
    }
}
