package com.ukhanyiso.matching.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChecklistApiTest {
    @Autowired MockMvc mvc;

    @Test
    void checklistRequiresLogin() throws Exception {
        mvc.perform(get("/api/checklist")).andExpect(status().isUnauthorized());
    }

    @Test
    void demoLearnerCanSaveAndReadProgress() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"demo@ukhanyiso.example\",\"password\":\"Ukhanyiso-Demo-2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Demo Learner"))
                .andExpect(jsonPath("$.csrfToken").isString())
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        String csrf = com.jayway.jsonpath.JsonPath.read(login.getResponse().getContentAsString(), "$.csrfToken");

        mvc.perform(put("/api/checklist").session(session)
                        .header("X-CSRF-Token", csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"school-results\",\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));

        mvc.perform(get("/api/checklist").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));
    }

    @Test
    void checklistRejectsMissingOrIncorrectCsrfToken() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"demo@ukhanyiso.example\",\"password\":\"Ukhanyiso-Demo-2026!\"}"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        mvc.perform(put("/api/checklist").session(session)
                        .header("X-CSRF-Token", "wrong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"school-results\",\"completed\":true}"))
                .andExpect(status().isForbidden());
    }
}
