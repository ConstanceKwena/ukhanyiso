package com.ukhanyiso.bursary;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BursaryApiTest {
    @Autowired private MockMvc mvc;

    @Test
    void getReturnsTheListAndADisclaimer() throws Exception {
        mvc.perform(get("/api/bursaries")).andExpect(status().isOk())
                .andExpect(jsonPath("$.bursaries.length()").value(11))
                .andExpect(jsonPath("$.bursaries[0].documents").isArray())
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());
    }

    @Test
    void theEndpointIsReadOnly() throws Exception {
        mvc.perform(post("/api/bursaries").contentType("application/json").content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void bursariesIncludeLastCheckedField() throws Exception {
        mvc.perform(get("/api/bursaries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bursaries[0].lastChecked").hasJsonPath())
                .andExpect(jsonPath("$.bursaries[1].lastChecked").hasJsonPath())
                .andExpect(jsonPath("$.bursaries[2].lastChecked").hasJsonPath())
                .andExpect(jsonPath("$.bursaries[3].lastChecked").hasJsonPath())
                .andExpect(jsonPath("$.bursaries[4].lastChecked").hasJsonPath());
    }

    @Test
    void bursaryEndpointRejectsRequestsAfterSixtyRequests() throws Exception {
        String clientAddress = "203.0.113.42";

        for (int i = 0; i < 60; i++) {
            mvc.perform(get("/api/bursaries")
                            .with(request -> {
                                request.setRemoteAddr(clientAddress);
                                return request;
                            }))
                    .andExpect(status().isOk());
        }

        mvc.perform(get("/api/bursaries")
                        .with(request -> {
                            request.setRemoteAddr(clientAddress);
                            return request;
                        }))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void oversizedRequestToBursaryEndpointIsRejected() throws Exception {
        String largeBody = "x".repeat(20_000);

        mvc.perform(post("/api/bursaries")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.43");
                            return request;
                        })
                        .contentType("application/json")
                        .content(largeBody))
                .andExpect(status().isPayloadTooLarge());
    }
}
