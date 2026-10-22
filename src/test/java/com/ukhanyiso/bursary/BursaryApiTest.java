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
                .andExpect(jsonPath("$.bursaries.length()").value(5))
                .andExpect(jsonPath("$.bursaries[0].documents").isArray())
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());
    }

    @Test
    void theEndpointIsReadOnly() throws Exception {
        mvc.perform(post("/api/bursaries").contentType("application/json").content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }
}
