package com.ukhanyiso.matching.api;

import com.jayway.jsonpath.JsonPath;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;

@SpringBootTest
@AutoConfigureMockMvc
class ChecklistApiTest {
    private static final AtomicInteger USER_SEQUENCE = new AtomicInteger();
    @Autowired MockMvc mvc;
    @Autowired ChecklistRepository repository;

    @Test
    void protectedPagesRedirectAndAuthPagesRemainPublic() throws Exception {
        mvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login.html"));
        mvc.perform(get("/study.html"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login.html"));
        MockHttpSession authenticated = new MockHttpSession();
        authenticated.setAttribute(ShowcaseSession.USER_ATTRIBUTE, "test-learner");
        mvc.perform(get("/").session(authenticated))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/index.html"));
        mvc.perform(get("/index.html")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/study.html").session(authenticated))
                .andExpect(status().isOk());
        mvc.perform(get("/start.html").session(authenticated))
                .andExpect(status().isOk());
        mvc.perform(get("/login.html")).andExpect(status().isOk());
        mvc.perform(get("/signup.html")).andExpect(status().isOk());
    }

    @Test
    void studyPlanIsUnavailableAfterLogout() throws Exception {
        MockHttpSession authenticated = new MockHttpSession();
        authenticated.setAttribute(ShowcaseSession.USER_ATTRIBUTE, "test-learner");
        authenticated.setAttribute(ShowcaseSession.CSRF_ATTRIBUTE, "test-csrf-token");

        mvc.perform(post("/api/auth/logout").session(authenticated)
                        .header("X-CSRF-Token", "test-csrf-token"))
                .andExpect(status().isOk());

        mvc.perform(get("/study.html"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login.html"));
    }

    @Test
    void checklistRequiresLogin() throws Exception {
        mvc.perform(get("/api/checklist")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void signupCreatesFictionalAccountAndSavesPrivateChecklistProgress() throws Exception {
        String username = nextUsername();
        String password = "fictional-password-123";
        AuthSession account = signup(username, password);

        PasswordHasher.Credentials saved = repository.credentials(username);
        assertTrue(saved != null);
        assertNotEquals(password, saved.hash());
        assertTrue(saved.hash().length() <= 64);

        mvc.perform(put("/api/checklist").session(account.session())
                        .header("X-CSRF-Token", account.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"school-results\",\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));

        mvc.perform(get("/api/checklist").session(account.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));
    }

    @Test
    void accountCanLogInAfterDatabaseIsClosedAndReopened(
            @TempDir Path tempDir) throws Exception {
        String url = "jdbc:h2:file:" + tempDir.resolve("persistent-auth");
        JdbcDataSource firstDataSource = dataSource(url);
        JdbcTemplate firstJdbc = new JdbcTemplate(firstDataSource);
        firstJdbc.execute("""
                CREATE TABLE app_users (
                    user_id VARCHAR(24) PRIMARY KEY
                        CHECK (LENGTH(user_id) BETWEEN 5 AND 24),
                    display_name VARCHAR(24) NOT NULL,
                    password_salt VARCHAR(64) NOT NULL,
                    password_hash VARCHAR(64) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
        firstJdbc.execute("""
                CREATE TABLE checklist_progress (
                    user_id VARCHAR(100) NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
                    item_id VARCHAR(80) NOT NULL,
                    completed INTEGER NOT NULL DEFAULT 0,
                    updated_at TIMESTAMP NOT NULL,
                    PRIMARY KEY (user_id, item_id)
                )
                """);
        ChecklistRepository firstRepository =
                new ChecklistRepository(firstJdbc);
        ShowcaseAuthController firstController =
                new ShowcaseAuthController(firstRepository, new PasswordRecoveryService(firstRepository));
        String username = nextUsername();
        String password = "fictional-password-persisted";

        MockHttpServletRequest signupRequest = new MockHttpServletRequest();
        String signupCsrf = firstController.csrf(signupRequest).csrfToken();
        firstController.signup(new ShowcaseAuthController.CredentialsRequest(username, password),
                signupCsrf, signupRequest);
        firstRepository.saveProgress(username, "school-results", true);
        try (var connection = firstDataSource.getConnection();
             var statement = connection.createStatement()) {
            statement.execute("SHUTDOWN");
        }
        JdbcDataSource restartedDataSource = dataSource(url);
        new UsernameSchemaMigration(new JdbcTemplate(restartedDataSource)).migrate();
        ChecklistRepository restartedRepository =
                new ChecklistRepository(new JdbcTemplate(restartedDataSource));
        ShowcaseAuthController restartedController =
                new ShowcaseAuthController(restartedRepository, new PasswordRecoveryService(restartedRepository));
        MockHttpServletRequest loginRequest = new MockHttpServletRequest();
        String loginCsrf = restartedController.csrf(loginRequest).csrfToken();
        ShowcaseAuthController.AuthResponse loggedIn = restartedController.login(
                new ShowcaseAuthController.CredentialsRequest(username, password),
                loginCsrf, loginRequest);

        assertEquals(username, loggedIn.username());
        assertTrue(restartedRepository.progress(username).get("school-results"));
    }

    @Test
    void usernamesMayContainThreeThroughFiftyCharacters() throws Exception {
        String password = "unique-fictional-password";
        String shortUsername = "a_1";
        String longUsername = "u".repeat(50);

        signup(shortUsername, password);
        signup(longUsername, password);

        for (String username : new String[]{shortUsername, longUsername}) {
            AuthSession attempt = csrfSession();
            mvc.perform(post("/api/auth/login").session(attempt.session())
                            .with(nextClient())
                            .header("X-CSRF-Token", attempt.csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(credentials(username, password)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value(username));
        }

        AuthSession tooLong = csrfSession();
        mvc.perform(post("/api/auth/signup").session(tooLong.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", tooLong.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("u".repeat(51), password)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void checklistProgressIsIsolatedBetweenLearners() throws Exception {
        String firstUsername = nextUsername();
        String secondUsername = nextUsername();
        AuthSession first = signup(firstUsername, "fictional-password-111");
        AuthSession second = signup(secondUsername, "fictional-password-222");

        mvc.perform(put("/api/checklist").session(first.session())
                        .header("X-CSRF-Token", first.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"school-results\",\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));

        mvc.perform(get("/api/checklist").session(second.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").doesNotExist());
        assertTrue(repository.progress(firstUsername).get("school-results"));
        assertTrue(repository.progress(secondUsername).isEmpty());
    }

    @Test
    void learnerJourneyMatchesMarksShowsFundingAndSavesChecklistProgress() throws Exception {
        AuthSession account = signup(nextUsername(), "fictional-password-match");
        String marks = """
                {"marks":[
                  {"subject":"English Home Language","mark":72},
                  {"subject":"Mathematics","mark":74},
                  {"subject":"Physical Sciences","mark":68},
                  {"subject":"Life Sciences","mark":66},
                  {"subject":"Accounting","mark":70},
                  {"subject":"Geography","mark":64},
                  {"subject":"Life Orientation","mark":80}]}""";

        mvc.perform(post("/api/match").session(account.session())
                        .with(nextClient())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(marks))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].course").isNotEmpty())
                .andExpect(jsonPath("$.results[0].officialLink").isNotEmpty())
                .andExpect(jsonPath("$.results[0].sourceChecked").isNotEmpty())
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());

        mvc.perform(get("/api/bursaries").session(account.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bursaries[1].status").value("verified"))
                .andExpect(jsonPath("$.bursaries[1].documents").isArray())
                .andExpect(jsonPath("$.bursaries[1].officialLink").value("https://www.nsfas.org.za"));

        mvc.perform(put("/api/checklist").session(account.session())
                        .header("X-CSRF-Token", account.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"school-results\",\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.school-results").value(true));
    }

    @Test
    void signupAndLoginRequireCsrfAndNeverReturnPasswords() throws Exception {
        String username = nextUsername();
        String password = "fictional-password-456";
        MvcResult preAuth = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.csrfToken").isString())
                .andReturn();
        MockHttpSession preAuthSession =
                (MockHttpSession) preAuth.getRequest().getSession(false);
        String csrf = JsonPath.read(preAuth.getResponse().getContentAsString(), "$.csrfToken");

        mvc.perform(post("/api/auth/signup").session(preAuthSession)
                        .with(nextClient())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, password)))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/auth/signup").session(preAuthSession)
                        .with(nextClient())
                        .header("X-CSRF-Token", csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.csrfToken").isString())
                .andReturn();

        MvcResult loginToken = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession loginSession =
                (MockHttpSession) loginToken.getRequest().getSession(false);
        String loginCsrf = JsonPath.read(loginToken.getResponse().getContentAsString(), "$.csrfToken");

        mvc.perform(post("/api/auth/login").session(loginSession)
                        .with(nextClient())
                        .header("X-CSRF-Token", loginCsrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "incorrect-fictional-password")))
                .andExpect(status().isUnauthorized());

        MvcResult loggedIn = mvc.perform(post("/api/auth/login").session(loginSession)
                        .with(nextClient())
                        .header("X-CSRF-Token", loginCsrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andReturn();
        assertTrue(!loggedIn.getResponse().getContentAsString().contains(password));

        MockHttpSession authenticated =
                (MockHttpSession) loggedIn.getRequest().getSession(false);
        String authenticatedCsrf =
                JsonPath.read(loggedIn.getResponse().getContentAsString(), "$.csrfToken");
        mvc.perform(post("/api/auth/logout").session(authenticated)
                        .header("X-CSRF-Token", authenticatedCsrf))
                .andExpect(status().isOk());
        mvc.perform(get("/api/checklist").session(authenticated))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateUsernamesAreRejectedAndLoginErrorsAreGeneric() throws Exception {
        String username = nextUsername();
        signup(username, "fictional-password-789");
        AuthSession attempt = csrfSession();

        mvc.perform(post("/api/auth/signup").session(attempt.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", attempt.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username.toUpperCase(), "another-fictional-pass")))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/login").session(attempt.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", attempt.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "another-fictional-pass")))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(""));
        mvc.perform(post("/api/auth/login").session(attempt.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", attempt.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("unknown-learner", "another-fictional-pass")))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(""));
    }

    @Test
    void invalidUsernameAndShortPasswordAreRejected() throws Exception {
        AuthSession attempt = csrfSession();
        mvc.perform(post("/api/auth/signup").session(attempt.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", attempt.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("x", "tiny")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signupRejectsPersonalInformationFields() throws Exception {
        AuthSession attempt = csrfSession();
        mvc.perform(post("/api/auth/signup").session(attempt.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", attempt.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"fictional-person\",\"password\":\"fictional-password-321\",\"email\":\"not-real@example.invalid\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void financialPlanEndpointIsNotAvailable() throws Exception {
        mvc.perform(get("/api/plan")).andExpect(status().isNotFound());
    }

    @Test
    void financialPlanCannotBeSavedToTheServer() throws Exception {
        mvc.perform(put("/api/plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"funding\":3000,\"months\":10}"))
                .andExpect(status().isNotFound());
    }

    private AuthSession signup(String username, String password) throws Exception {
        AuthSession preAuth = csrfSession();
        MvcResult created = mvc.perform(post("/api/auth/signup").session(preAuth.session())
                        .with(nextClient())
                        .header("X-CSRF-Token", preAuth.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andReturn();
        MockHttpSession authenticated =
                (MockHttpSession) created.getRequest().getSession(false);
        String csrf = JsonPath.read(created.getResponse().getContentAsString(), "$.csrfToken");
        return new AuthSession(authenticated, csrf);
    }

    private AuthSession csrfSession() throws Exception {
        MvcResult result = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        String csrf = JsonPath.read(result.getResponse().getContentAsString(), "$.csrfToken");
        return new AuthSession(session, csrf);
    }

    private static String nextUsername() {
        return "learner" + USER_SEQUENCE.incrementAndGet();
    }

    private static String credentials(String username, String password) {
        return "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    }

    private static RequestPostProcessor nextClient() {
        int address = USER_SEQUENCE.incrementAndGet() % 250 + 1;
        return request -> {
            request.setRemoteAddr("192.0.2." + address);
            return request;
        };
    }

    private static JdbcDataSource dataSource(String url) {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL(url);
        dataSource.setUser("sa");
        dataSource.setPassword("");
        return dataSource;
    }

    private record AuthSession(MockHttpSession session, String csrf) { }
}
