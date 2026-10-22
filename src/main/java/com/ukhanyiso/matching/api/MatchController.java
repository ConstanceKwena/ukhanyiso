package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.CourseMatchService;
import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MatchController {

    static final String DISCLAIMER =
            "Labels are a guide only. Meeting the minimum does not guarantee a place. Always confirm with the institution before applying.";

    private final CourseMatchService service;

    public MatchController(CourseMatchService service) {
        this.service = service;
    }

    /** includeAll=true also returns courses that do not fit and courses we cannot check. */
    @PostMapping("/match")
    public MatchResponse match(@RequestBody MatchRequest request,
                               @RequestParam(name = "includeAll", defaultValue = "false") boolean includeAll) {
        List<SubjectMark> marks = MarksValidator.validate(request);
        return new MatchResponse(service.match(marks, includeAll), DISCLAIMER);
    }
}
