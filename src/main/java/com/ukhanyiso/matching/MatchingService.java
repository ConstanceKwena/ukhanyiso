package com.ukhanyiso.matching;

import com.ukhanyiso.matching.model.MatchingRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MatchingService {

    private final MatchingRepository matchingRepository;

    public MatchingService(MatchingRepository matchingRepository) {
        this.matchingRepository = matchingRepository;
    }

    @Transactional
    public MatchingRecord processAndPersist(String sourceReference) {
        if (sourceReference == null || sourceReference.isBlank()) {
            throw new IllegalArgumentException("Official source reference cannot be empty.");
        }
        
        MatchingRecord record = new MatchingRecord();
        record.setSourceReference(sourceReference);
        record.setMatchStatus("PENDING");
        
        return matchingRepository.save(record);
    }
}
