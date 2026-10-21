package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.catalog.CatalogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** End-to-end checks of POST /api/match through the real controller, validator, matcher and database. */
@SpringBootTest
@AutoConfigureMockMvc
class MatchApiTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    CatalogRepository repository;

    static final String GOOD = """
            {"marks":[
              {"subject":"English Home Language","mark":72},{"subject":"Mathematics","mark":74},
              {"subject":"Physical Sciences","mark":68},{"subject":"Life Sciences","mark":66},
              {"subject":"Accounting","mark":70},{"subject":"Geography","mark":64},
              {"subject":"Life Orientation","mark":80}]}""";

    private org.springframework.test.web.servlet.ResultActions send(String body) throws Exception {
        return mvc.perform(post("/api/match").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void validMarksReturnRankedResults() throws Exception {
        send(GOOD).andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].course").exists())
                .andExpect(jsonPath("$.results[0].officialLink").exists())
                .andExpect(jsonPath("$.disclaimer").exists());
    }

    @Test
    void marksStringsFromTheFormAreAccepted() throws Exception {
        send("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":\"70\"}]}").andExpect(status().isOk());
    }

    @Test
    void includeAllAddsCoursesThatDoNotFit() throws Exception {
        String body = "{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":20}]}";
        send(body).andExpect(jsonPath("$.results.length()").value(0));
        mvc.perform(post("/api/match").param("includeAll", "true").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.results.length()").value(12));
    }

    @Test
    void scriptTagSubjectIsRejectedAndNotEchoed() throws Exception {
        send("{\"marks\":[{\"subject\":\"<script>alert(1)</script>\",\"mark\":70}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]").value("Please choose a subject from the list."))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("script"))));
    }

    @Test
    void sqlInjectionTextLeavesTheDatabaseIntact() throws Exception {
        send("{\"marks\":[{\"subject\":\"'; DROP TABLE courses; --\",\"mark\":70}]}").andExpect(status().isBadRequest());
        assertEquals(12, repository.load().courses().size());
    }

    @Test
    void markOutOfRangeIsRejected() throws Exception {
        send("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":101}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]").value("Marks must be between 0 and 100."));
    }

    @Test
    void unexpectedExtraFieldIsRejected() throws Exception {
        send("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":70}],\"isAdmin\":true}").andExpect(status().isBadRequest());
    }

    @Test
    void malformedJsonGivesASafeMessage() throws Exception {
        send("{not json").andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Exception"))));
    }

    @Test
    void oversizedBodyIsRejected() throws Exception {
        String padding = "x".repeat(5000);
        send("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":70}],\"pad\":\"" + padding + "\"}")
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    void badIncludeAllValueIsRejected() throws Exception {
        mvc.perform(post("/api/match").param("includeAll", "maybe").contentType(MediaType.APPLICATION_JSON).content(GOOD))
                .andExpect(status().isBadRequest());
    }
}
