package com.ukhanyiso.matching.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Server-side storage of learner reminders, so the app can deliver WhatsApp
 * and email reminders even when the browser that created the reminder is
 * closed. The front end posts each reminder here when it is saved.
 */
@RestController
@RequestMapping("/api/reminders")
public class ReminderDeliveryController {

    private final ChecklistRepository repository;

    public ReminderDeliveryController(ChecklistRepository repository) {
        this.repository = repository;
    }

    public record ReminderRequest(String title, String date, String time) {
    }

    public record ReminderResponse(String csrfToken, List<ChecklistRepository.ReminderDelivery> deliveries) {
    }

    /** Saves delivery entries for one reminder (WhatsApp and/or email). */
    @PostMapping
    public ReminderResponse save(
            @RequestBody(required = false) ReminderRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        ShowcaseSession.requireCsrf(session, token);
        if (body == null || body.title() == null || body.title().isBlank()
                || body.title().length() > 200 || body.date() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder.");
        }
        LocalDate date;
        try {
            date = LocalDate.parse(body.date());
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder date.");
        }
        // Optional exact time of day; "09:30" or "09:30:00" are both accepted.
        java.time.LocalTime time = null;
        if (body.time() != null && !body.time().isBlank()) {
            try {
                time = java.time.LocalTime.parse(body.time().trim());
            } catch (RuntimeException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder time.");
            }
        }
        ChecklistRepository.Profile profile = repository.profile(user);
        // WhatsApp: only when the learner opted in and saved a number.
        if (profile.whatsappOptIn() && profile.whatsapp() != null) {
            repository.addReminderDelivery(user, body.title().trim(), date, time, "whatsapp");
        }
        // Email: only when a contact email is present.
        if (profile.contactEmail() != null) {
            repository.addReminderDelivery(user, body.title().trim(), date, time, "email");
        }
        if (profile.whatsappOptIn() && profile.whatsapp() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Add a WhatsApp number on your profile so we know where to send reminders.");
        }
        return new ReminderResponse(ShowcaseSession.csrf(session), repository.deliveries(user));
    }

    /** The learner deleted a reminder: stop its deliveries. */
    @DeleteMapping
    public ReminderResponse remove(
            @RequestBody(required = false) ReminderRequest body,
            @RequestHeader(value = "X-CSRF-Token", required = false) String token,
            HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        ShowcaseSession.requireCsrf(session, token);
        if (body == null || body.title() == null || body.date() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder.");
        }
        try {
            repository.removeReminderDeliveries(user, body.title().trim(), LocalDate.parse(body.date()));
        } catch (RuntimeException ignored) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder date.");
        }
        return new ReminderResponse(ShowcaseSession.csrf(session), repository.deliveries(user));
    }

    @GetMapping
    public ReminderResponse list(HttpSession session) {
        String user = ShowcaseSession.requireUser(session);
        return new ReminderResponse(ShowcaseSession.csrf(session), repository.deliveries(user));
    }
}
