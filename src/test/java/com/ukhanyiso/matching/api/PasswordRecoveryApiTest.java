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


import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PasswordRecoveryApiTest {
    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    MockMvc mvc;
    @Autowired
    ChecklistRepository repository;

    @Test
    void recoveryEmailIsStoredOnlyAsHash() throws Exception {
        AuthSession account = signup(nextUsername(), "fictional-password-recover");
        String email = "learner-" + account.username() + "@example.invalid";

        mvc.perform(put("/api/auth/recovery-email").session(account.session())
                .header("X-CSRF-Token", account.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isOk());

        String stored = repository.recoveryCredentials(account.username()).hash();
        assertTrue(stored != null);
        assertTrue(!stored.contains(email), "email must never be stored in plaintext");
    }

    @Test
    void forgotPasswordAlwaysAcceptsAndNeverRevealsAccounts() throws Exception {
        AuthSession attempt = csrfSession();
        mvc.perform(post("/api/auth/forgot-password").session(attempt.session())
                .header("X-CSRF-Token", attempt.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"known-or-not@example.invalid\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/auth/forgot-password").session(attempt.session())
                .header("X-CSRF-Token", attempt.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"definitely-unknown@example.invalid\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void resetWithTokenChangesThePassword() throws Exception {
        String username = nextUsername();
        AuthSession account = signup(username, "fictional-password-recover");
        String email = "learner-" + username + "@example.invalid";
        mvc.perform(put("/api/auth/recovery-email").session(account.session())
                .header("X-CSRF-Token", account.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isOk());

        RecordingRecovery recording = new RecordingRecovery(repository);
        assertTrue(recording.requestReset(email));
        assertTrue(recording.lastToken != null);

        String newPassword = "fresh-fictional-password";
        AuthSession resetter = csrfSession();
        mvc.perform(post("/api/auth/reset-password").session(resetter.session())
                .header("X-CSRF-Token", resetter.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + recording.lastToken + "\",\"newPassword\":\"" + newPassword + "\"}"))
                .andExpect(status().isOk());

        PasswordHasher.Credentials credentials = repository.credentials(username);
        assertTrue(new PasswordHasher().matches(newPassword.toCharArray(), credentials));
        assertTrue(!new PasswordHasher().matches("fictional-password-recover".toCharArray(), credentials));

        // The token is one-time only.
        AuthSession replay = csrfSession();
        mvc.perform(post("/api/auth/reset-password").session(replay.session())
                .header("X-CSRF-Token", replay.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + recording.lastToken + "\",\"newPassword\":\"another-password-999\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetRejectsInvalidTokenAndShortPassword() throws Exception {
        AuthSession attempt = csrfSession();
        mvc.perform(post("/api/auth/reset-password").session(attempt.session())
                .header("X-CSRF-Token", attempt.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"bogus-token\",\"newPassword\":\"a-valid-new-password\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/reset-password").session(attempt.session())
                .header("X-CSRF-Token", attempt.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"also-bogus\",\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    private AuthSession csrfSession() throws Exception {
        MvcResult result = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        return new AuthSession("csrf-session", session,
                JsonPath.read(result.getResponse().getContentAsString(), "$.csrfToken"));
    }

    private AuthSession signup(String username, String password) throws Exception {
        MvcResult preAuth = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) preAuth.getRequest().getSession(false);
        String csrf = JsonPath.read(preAuth.getResponse().getContentAsString(), "$.csrfToken");
        MvcResult created = mvc.perform(post("/api/auth/signup").session(session)
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

    private static String nextUsername() {
        return "learner-" + SEQUENCE.incrementAndGet();
    }

    /** Test-only subclass that captures the prototype-delivered token. */
    static class RecordingRecovery extends PasswordRecoveryService {
        String lastToken;

        RecordingRecovery(ChecklistRepository repository) {
            super(repository);
        }

        @Override
        void deliverToken(String userId, String token) {
            lastToken = token;
        }
    }
}

record AuthSession(String username, MockHttpSession session, String csrf) {
}
