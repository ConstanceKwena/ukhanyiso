package com.ukhanyiso.matching.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LearnerMarksApiTest {
    private static final AtomicInteger SEQUENCE = new AtomicInteger();
    private static final String CSRF = "learner-marks-test-csrf";

    @Autowired
    MockMvc mvc;

    @Autowired
    ChecklistRepository accounts;

    @Test
    void savesReloadsAndEditsMarksPerAccount() throws Exception {
        String user = createUser();
        MockHttpSession session = session(user);

        mvc.perform(put("/api/marks").session(session)
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":\"70\"}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks[0].mark").value(70));

        mvc.perform(get("/api/marks").session(session(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks[0].subject").value("Mathematics"))
                .andExpect(jsonPath("$.marks[0].mark").value(70));

        mvc.perform(put("/api/marks").session(session)
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":82}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks[0].mark").value(82));

        mvc.perform(get("/api/marks").session(session(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks[0].mark").value(82));
    }

    @Test
    void learnersCannotReadOrOverwriteAnotherAccountsMarks() throws Exception {
        String firstUser = createUser();
        String secondUser = createUser();
        mvc.perform(put("/api/marks").session(session(firstUser))
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":70}]}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/marks").session(session(secondUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks").isEmpty());
        mvc.perform(put("/api/marks").session(session(secondUser))
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Accounting\",\"mark\":95}]}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/marks").session(session(firstUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marks[0].subject").value("Mathematics"))
                .andExpect(jsonPath("$.marks[0].mark").value(70));
    }

    @Test
    void marksRequireAuthenticationCsrfAndValidSubjectsAndValues() throws Exception {
        mvc.perform(get("/api/marks")).andExpect(status().isUnauthorized());
        String user = createUser();
        MockHttpSession session = session(user);

        mvc.perform(put("/api/marks").session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":70}]}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/marks").session(session)
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Unknown subject\",\"mark\":70}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]").value(MarksValidator.UNKNOWN_SUBJECT));
        mvc.perform(put("/api/marks").session(session)
                        .header("X-CSRF-Token", CSRF)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":101}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]").value(MarksValidator.RANGE));
    }

    private String createUser() {
        String username = "marks-" + SEQUENCE.incrementAndGet() + "@example.invalid";
        accounts.createAccount(username, "test-salt", "test-hash");
        return username;
    }

    private static MockHttpSession session(String username) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(ShowcaseSession.USER_ATTRIBUTE, username);
        session.setAttribute(ShowcaseSession.CSRF_ATTRIBUTE, CSRF);
        return session;
    }
}
