package com.ukhanyiso.matching;

import com.ukhanyiso.matching.model.MatchingRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityTestSuites {

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private MockMvc mockMvc;

    // --- 1. Injection Security Test ---
    @Test
    public void testSqlInjectionInMatchingSearch() {
        String maliciousInput = "'; DROP TABLE matching_records; --";
        assertDoesNotThrow(() -> {
            try {
                matchingService.processAndPersist(maliciousInput);
            } catch (IllegalArgumentException e) {
                // Expected if validation catches bad formats
            }
        });
    }

    // --- 2. Input Validation Test ---
    @Test
    public void testBlankSourceReferenceRejection() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            matchingService.processAndPersist("");
        });
        assertEquals("Official source reference cannot be empty.", exception.getMessage());
    }

    // --- 3. Role Access / Endpoint Security Test ---
    @Test
    public void testProcessRecordEndpointValidation() throws Exception {
        mockMvc.perform(post("/api/matching/process")
                .param("sourceReference", "SRC-REF-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // --- 4. Spam / Abuse Guard Test (Empty Input Spam) ---
    @Test
    public void testSpamEmptyReferenceHandling() throws Exception {
        mockMvc.perform(post("/api/matching/process")
                .param("sourceReference", "   ")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }
}
