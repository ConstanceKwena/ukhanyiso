package com.ukhanyiso.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Sends WhatsApp reminder messages through the Meta WhatsApp Cloud API.
 *
 * <p>
 * Configure with WHATSAPP_PHONE_ID and WHATSAPP_TOKEN (and optionally
 * WHATSAPP_API_BASE for a regional endpoint). When either value is missing the
 * message is written to the application log instead, so local development and
 * tests keep working without a WhatsApp account.
 * </p>
 */
@Service
public class WhatsAppDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppDeliveryService.class);

    private final String phoneNumberId;
    private final String accessToken;
    private final String apiBase;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public WhatsAppDeliveryService(
            @Value("${whatsapp.phone-number-id:}") String phoneNumberId,
            @Value("${whatsapp.access-token:}") String accessToken,
            @Value("${whatsapp.api-base:https://graph.facebook.com/v20.0}") String apiBase) {
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.apiBase = apiBase;
    }

    public boolean configured() {
        return phoneNumberId != null && !phoneNumberId.isBlank()
                && accessToken != null && !accessToken.isBlank();
    }

    /**
     * Sends a text message. Returns true when the API accepted it; false when
     * delivery failed or WhatsApp is not configured.
     */
    public boolean sendText(String toPhoneNumber, String text) {
        if (!configured()) {
            log.info("WhatsApp not configured; would send to {}: {}", toPhoneNumber, text);
            return false;
        }
        String to = toPhoneNumber.replaceAll("[^0-9]", "");
        try {
            String payload = "{"
                    + "\"messaging_product\":\"whatsapp\","
                    + "\"to\":\"" + to + "\","
                    + "\"type\":\"text\","
                    + "\"text\":{\"body\":\"" + text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
                    + "\"}"
                    + "}";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBase + "/" + phoneNumberId + "/messages"))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return true;
            }
            log.warn("WhatsApp API returned {}: {}", response.statusCode(), response.body());
            return false;
        } catch (Exception exception) {
            log.error("Could not send WhatsApp message: {}", exception.getMessage());
            return false;
        }
    }
}
