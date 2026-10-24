package com.ukhanyiso.bursary;

import com.ukhanyiso.matching.api.ShowcaseSession;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/bursaries: read-only, takes no input, so there is nothing to inject or validate. */
@RestController
@RequestMapping("/api")
public class BursaryController {
    private final BursaryService service;

    public BursaryController(BursaryService service) {
        this.service = service;
    }

    @GetMapping("/bursaries")
    public BursaryResponse bursaries(HttpSession session) {
        ShowcaseSession.requireUser(session);
        return service.list();
    }
}
