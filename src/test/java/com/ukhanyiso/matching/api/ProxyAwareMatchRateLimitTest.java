package com.ukhanyiso.matching.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProxyAwareMatchRateLimitTest {

    private final HttpClient http = HttpClient.newHttpClient();

    @LocalServerPort
    int port;

    @Test
    void forwardedClientAddressesHaveIndependentMatchLimits() throws Exception {
        URI uri = URI.create("http://127.0.0.1:" + port + "/api/match");
        String body = "{\"marks\":[{\"subject\":\"Mathematics\",\"mark\":70}]}";

        for (int request = 0; request < MatchRateLimitFilter.MATCH_MAX_REQUESTS; request++) {
            assertEquals(401, postMatch(uri, body, "198.51.100.71"));
        }

        assertEquals(429, postMatch(uri, body, "198.51.100.71"));
        assertEquals(401, postMatch(uri, body, "198.51.100.72"));
    }

    private int postMatch(URI uri, String body, String clientAddress) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .header("Content-Type", "application/json")
                .header("X-Forwarded-For", clientAddress)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return http.send(request, HttpResponse.BodyHandlers.ofString()).statusCode();
    }
}
