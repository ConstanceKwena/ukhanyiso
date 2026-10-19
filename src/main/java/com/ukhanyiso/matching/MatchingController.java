package com.ukhanyiso.matching;

import com.ukhanyiso.matching.model.MatchingRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/process")
    public ResponseEntity<MatchingRecord> processRecord(@RequestParam String sourceReference) {
        MatchingRecord record = matchingService.processAndPersist(sourceReference);
        return ResponseEntity.ok(record);
    }
}
