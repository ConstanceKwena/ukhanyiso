package com.ukhanyiso.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Delivers password-recovery emails. When MAIL_ENABLED is not set to true
 * (local development, tests) nothing is sent and the token falls back to the
 * application log, so behaviour matches the previous prototype.
 */
@Service
@ConditionalOnProperty(name = "mail.enabled", havingValue = "true")
public class MailDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(MailDeliveryService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public MailDeliveryService(JavaMailSender mailSender,
            @Value("${mail.from:noreply@ukhanyiso.org}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendPasswordReset(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Ukhanyiso password reset");
        message.setText("Someone asked to reset your Ukhanyiso password.\n\n"
                + "Use this one-time link within the next hour:\n"
                + "https://ukhanyiso.onrender.com/reset.html?token=" + token + "\n\n"
                + "If this was not you, ignore this email. Your password is unchanged.\n\n"
                + "Ukhanyiso");
        try {
            mailSender.send(message);
        } catch (RuntimeException exception) {
            // Never leak whether the account exists: log instead of failing the request.
            log.error("Could not send password reset email: {}", exception.getMessage());
        }
    }

    /** Sends a general reminder email (used by the reminder delivery job). */
    public void sendReminder(String to, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Ukhanyiso reminder");
        message.setText(text + "\n\nUkhanyiso");
        try {
            mailSender.send(message);
        } catch (RuntimeException exception) {
            log.error("Could not send reminder email: {}", exception.getMessage());
        }
    }
}
