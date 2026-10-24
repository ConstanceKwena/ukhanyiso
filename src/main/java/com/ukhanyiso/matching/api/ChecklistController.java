
package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChecklistController {
    private static final List<ChecklistItem> ITEMS = List.of(
            new ChecklistItem("id-document", "Certified ID or birth certificate", "identity"),
            new ChecklistItem("school-results", "Latest school results", "academic"),
            new ChecklistItem("proof-of-residence", "Proof of home address", "residence"),
            new ChecklistItem("parent-id", "Certified copy of parent/guardian ID", "family"),
            new ChecklistItem("parent-income", "Proof of household income (pay slip, pension slip, or affidavit)", "financial")
    );

    private final ChecklistRepository repository;

    public ChecklistController(ChecklistRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/checklist")
    public ChecklistResponse checklist(HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        return new ChecklistResponse(
                ITEMS, repository.progress(user), ShowcaseSession.csrf(session));
    }

    // Supports the PUT /api/checklist request used by ChecklistApiTest.
    @PutMapping("/checklist")
    public ChecklistResponse updateChecklist(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);

        if (token == null || !ShowcaseSession.csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }

        Object itemIdValue = body == null ? null : body.get("itemId");
        Object completedValue = body == null ? null : body.get("completed");

        if (!(itemIdValue instanceof String itemId)
                || ITEMS.stream().noneMatch(item -> item.id().equals(itemId))
                || !(completedValue instanceof Boolean completed)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid checklist item.");
        }

        repository.saveProgress(user, itemId, completed);

        return new ChecklistResponse(
                ITEMS, repository.progress(user), ShowcaseSession.csrf(session));
    }

    @RequestMapping(
            value = "/checklist/{itemId}",
            method = {RequestMethod.PUT, RequestMethod.POST})
    public ChecklistResponse setItem(
            @PathVariable String itemId,
            @RequestBody(required = false) Map<String, Boolean> body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);

        if (token == null || !ShowcaseSession.csrf(session).equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid CSRF token.");
        }

        boolean validItem = ITEMS.stream()
                .anyMatch(item -> item.id().equals(itemId));

        if (!validItem) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid checklist item.");
        }

        boolean completed = body != null
                && Boolean.TRUE.equals(body.get("completed"));

        repository.saveProgress(user, itemId, completed);

        return new ChecklistResponse(
                ITEMS, repository.progress(user), ShowcaseSession.csrf(session));
    }

    public record ChecklistItem(String id, String label, String category) { }

    public record ChecklistResponse(
            List<ChecklistItem> items,
            Map<String, Boolean> progress,
            String csrfToken) { }

}