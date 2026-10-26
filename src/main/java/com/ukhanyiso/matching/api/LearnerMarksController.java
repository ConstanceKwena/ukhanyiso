package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.api.LearnerMarksRepository.SavedMark;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class LearnerMarksController {
    private final LearnerMarksRepository repository;

    public LearnerMarksController(LearnerMarksRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public MarksResponse getMarks(HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        return new MarksResponse(repository.findByUser(user), ShowcaseSession.csrf(session));
    }

    @PutMapping
    public MarksResponse saveMarks(
            @RequestBody(required = false) MatchRequest request,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        if (token == null || !ShowcaseSession.csrf(session).equals(token)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }
        if (request == null || request.marks() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid marks.");
        }

        List<MatchRequest.MarkEntry> submitted = request.marks();
        if (submitted.size() > MarksValidator.MAX_SUBJECTS) {
            throw new InvalidMarksException(List.of(MarksValidator.TOO_MANY));
        }
        List<MatchRequest.MarkEntry> marksToSave = submitted.stream()
                .filter(entry -> entry != null && !isBlank(entry.subject()) && !isBlank(entry.mark()))
                .toList();
        boolean hasIncompleteRow = submitted.stream().anyMatch(entry ->
                entry == null || isBlank(entry.subject()) != isBlank(entry.mark()));
        if (hasIncompleteRow) {
            throw new InvalidMarksException(List.of(MarksValidator.EMPTY));
        }

        List<SavedMark> saved;
        if (marksToSave.isEmpty()) {
            saved = List.of();
        } else {
            MarksValidator.validate(new MatchRequest(marksToSave));
            saved = marksToSave.stream()
                    .map(entry -> new SavedMark(entry.subject(), wholeNumber(entry.mark())))
                    .toList();
        }

        repository.replaceForUser(user, saved);
        return new MarksResponse(saved, ShowcaseSession.csrf(session));
    }

    private static boolean isBlank(Object value) {
        return value == null || (value instanceof String text && text.isBlank());
    }

    private static int wholeNumber(Object value) {
        return value instanceof Number number ? number.intValue() : Integer.parseInt((String) value);
    }

    public record MarksResponse(List<SavedMark> marks, String csrfToken) { }
}
