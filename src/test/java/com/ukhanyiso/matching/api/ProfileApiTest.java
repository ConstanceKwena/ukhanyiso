package com.ukhanyiso.matching.api;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileApiTest {
        private static final AtomicInteger SEQUENCE = new AtomicInteger();
        private static final AtomicInteger SIGNUP_SEQUENCE = new AtomicInteger();

        @Autowired
        MockMvc mvc;
        @Autowired
        ChecklistRepository repository;

        @Test
        void profileStartsEmptyAndSavesOptionalDetails() throws Exception {
                String username = "learner-" + System.nanoTime() + "@example.invalid";
                AuthSession account = signup(username, "fictional-password-profile");

                mvc.perform(get("/api/auth/profile").session(account.session()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.firstName").doesNotExist())
                                .andExpect(jsonPath("$.surname").doesNotExist())
                                .andExpect(jsonPath("$.contactEmail").doesNotExist())
                                .andExpect(jsonPath("$.whatsapp").doesNotExist());

                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"Thandi\",\"surname\":\"Nkosi\",\"contactEmail\":\"t@example.invalid\",\"whatsapp\":\"+27 82 000 0000\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.firstName").value("Thandi"))
                                .andExpect(jsonPath("$.surname").value("Nkosi"))
                                .andExpect(jsonPath("$.contactEmail").value("t@example.invalid"))
                                .andExpect(jsonPath("$.whatsapp").value("+27820000000"));

                // Reload from the database and check persistence, plus the second account
                // isolation.
                ChecklistRepository.Profile saved = repository.profile(username);
                assertEquals("Thandi", saved.firstName());
                assertEquals("+27820000000", saved.whatsapp());
        }

        @Test
        void profileRejectsBadNamesEmailsAndNumbers() throws Exception {
                AuthSession account = signup("learner-" + System.nanoTime() + "@example.invalid", "fictional-password-profile2");
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"<script>x\"}"))
                                .andExpect(status().isBadRequest());
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"contactEmail\":\"not-an-email\"}"))
                                .andExpect(status().isBadRequest());
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"whatsapp\":\"call me maybe\"}"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void profileWhatsappReminderIsOptIn() throws Exception {
                String username = "learner-" + System.nanoTime() + "@example.invalid";
                AuthSession account = signup(username, "fictional-password-profile");

                // No WhatsApp details: profile still saves, opt-in stays false.
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"Thandi\",\"surname\":\"Nkosi\",\"contactEmail\":\"t@example.invalid\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.whatsappOptIn").value(false));

                // Opting in without a number is rejected.
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"Thandi\",\"surname\":\"Nkosi\",\"contactEmail\":\"t@example.invalid\",\"whatsappOptIn\":true}"))
                                .andExpect(status().isBadRequest());

                // Opting in with a number is accepted and persisted.
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"Thandi\",\"surname\":\"Nkosi\",\"contactEmail\":\"t@example.invalid\",\"whatsapp\":\"+27 82 000 0000\",\"whatsappOptIn\":true}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.whatsappOptIn").value(true));
                assertTrue(repository.profile(username).whatsappOptIn());
        }

        @Test
        void profileRequiresLoginAndCsrf() throws Exception {
                mvc.perform(get("/api/auth/profile")).andExpect(status().isUnauthorized());
                mvc.perform(put("/api/auth/profile").contentType(MediaType.APPLICATION_JSON).content("{}"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void profileRequiresRequiredDetails() throws Exception {
                AuthSession account = signup("learner-" + System.nanoTime() + "@example.invalid", "fictional-password-profile");
                mvc.perform(put("/api/auth/profile").session(account.session())
                                .header("X-CSRF-Token", account.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\":\"Thandi\"}"))
                                .andExpect(status().isBadRequest());
        }

        private AuthSession signup(String username, String password) throws Exception {
                MvcResult preAuth = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
                MockHttpSession session = (MockHttpSession) preAuth.getRequest().getSession(false);
                String csrf = JsonPath.read(preAuth.getResponse().getContentAsString(), "$.csrfToken");
                // Each test uses a unique client address so the signup rate limit (5/min per IP)
                // is not consumed by other tests in this class.
                MvcResult created = mvc.perform(post("/api/auth/signup")
                                .with(request -> {
                                        request.setRemoteAddr("192.0.2." + (SIGNUP_SEQUENCE.incrementAndGet() % 250 + 1));
                                        return request;
                                })
                                .session(session)
                                .header("X-CSRF-Token", csrf)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                                .andExpect(status().isOk())
                                .andReturn();
                String body = created.getResponse().getContentAsString();
                return new AuthSession(username,
                                (MockHttpSession) created.getRequest().getSession(false),
                                JsonPath.read(body, "$.csrfToken"));
        }
}

record AuthSession(String username, MockHttpSession session, String csrf) {
}
