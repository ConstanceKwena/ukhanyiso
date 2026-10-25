package com.ukhanyiso.matching.api;

import com.jayway.jsonpath.JsonPath;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
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
        new ResourceDatabasePopulator(new ClassPathResource("schema.sql"))
                .execute(firstDataSource);
        ChecklistRepository firstRepository =
                new ChecklistRepository(new JdbcTemplate(firstDataSource));
        ShowcaseAuthController firstController =
                new ShowcaseAuthController(firstRepository);
        String username = nextUsername();
        String password = "fictional-password-persisted";

        MockHttpServletRequest signupRequest = new MockHttpServletRequest();
        String signupCsrf = firstController.csrf(signupRequest).csrfToken();
        firstController.signup(new ShowcaseAuthController.CredentialsRequest(username, password),
                signupCsrf, signupRequest);
        try (var connection = firstDataSource.getConnection();
             var statement = connection.createStatement()) {
            statement.execute("SHUTDOWN");
        }

        ChecklistRepository restartedRepository =
                new ChecklistRepository(new JdbcTemplate(dataSource(url)));
        ShowcaseAuthController restartedController =
                new ShowcaseAuthController(restartedRepository);
        MockHttpServletRequest loginRequest = new MockHttpServletRequest();
        String loginCsrf = restartedController.csrf(loginRequest).csrfToken();
        ShowcaseAuthController.AuthResponse loggedIn = restartedController.login(
                new ShowcaseAuthController.CredentialsRequest(username, password),
                loginCsrf, loginRequest);

        assertEquals(username, loggedIn.username());
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
                        .content(credentials("bad", "tiny")))
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
