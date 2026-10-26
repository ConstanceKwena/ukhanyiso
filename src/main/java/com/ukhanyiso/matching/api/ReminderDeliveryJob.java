package com.ukhanyiso.matching.api;

import com.ukhanyiso.config.MailDeliveryService;
import com.ukhanyiso.config.WhatsAppDeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Delivers due reminders through WhatsApp and email.
 *
 * <p>
 * Runs every minute. A reminder is sent at its exact time on its date — or,
 * when no time was chosen, on the morning of its date — and on any later run
 * until it succeeds, so a server that was down still delivers.
 * WhatsApp messages go to opted-in learners through the WhatsApp Cloud API;
 * email goes through the existing mail sender. When a channel is not
 * configured the delivery is marked with a clear status instead of failing.
 * </p>
 */
@Component
public class ReminderDeliveryJob {

    private static final Logger log = LoggerFactory.getLogger(ReminderDeliveryJob.class);

    private final ChecklistRepository repository;
    private final WhatsAppDeliveryService whatsapp;
    private final ObjectProvider<MailDeliveryService> mailDelivery;

    public ReminderDeliveryJob(ChecklistRepository repository,
            WhatsAppDeliveryService whatsapp,
            ObjectProvider<MailDeliveryService> mailDelivery) {
        this.repository = repository;
        this.whatsapp = whatsapp;
        this.mailDelivery = mailDelivery;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 15_000)
    public void deliverDue() {
        LocalDate today = LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();
        List<ChecklistRepository.ReminderDelivery> due = repository.pendingDeliveries(today, now);
        for (ChecklistRepository.ReminderDelivery delivery : due) {
            try {
                deliverOne(delivery, today);
            } catch (RuntimeException exception) {
                log.error("Reminder delivery {} failed: {}", delivery.id(), exception.getMessage());
                repository.markDelivered(delivery.id(), "failed", "Unexpected error: " + exception.getMessage());
            }
        }
        if (!due.isEmpty()) {
            log.info("Processed {} due reminder deliveries", due.size());
        }
    }

    private void deliverOne(ChecklistRepository.ReminderDelivery delivery, LocalDate today) {
        ChecklistRepository.Profile profile = repository.profile(delivery.userId());
        String title = delivery.title();
        String when;
        if (delivery.remindTime() != null) {
            when = delivery.remindDate().equals(today) ? "at " + delivery.remindTime()
                    : "on " + delivery.remindDate() + " at " + delivery.remindTime();
        } else {
            when = delivery.remindDate().equals(today) ? "today" : "on " + delivery.remindDate();
        }
        String text = "Ukhanyiso reminder: " + title + " is due " + when + ". "
                + "Open Ukhanyiso to check the details.";

        if ("whatsapp".equals(delivery.channel())) {
            if (profile.whatsappOptIn() && profile.whatsapp() != null) {
                if (whatsapp.configured()) {
                    boolean sent = whatsapp.sendText(profile.whatsapp(), text);
                    repository.markDelivered(delivery.id(),
                            sent ? "sent" : "failed",
                            sent ? null : "WhatsApp API rejected the message.");
                } else {
                    log.info("Reminder for {} (WhatsApp not configured): {}", delivery.userId(), text);
                    repository.markDelivered(delivery.id(), "sent", "Logged (WhatsApp not configured).");
                }
            } else {
                repository.markDelivered(delivery.id(), "no_address", "Learner has no opted-in WhatsApp number.");
            }
            return;
        }

        // email channel
        MailDeliveryService mail = mailDelivery.getIfAvailable();
        if (profile.contactEmail() != null && mail != null) {
            try {
                mail.sendReminder(profile.contactEmail(), text);
                repository.markDelivered(delivery.id(), "sent", null);
            } catch (RuntimeException exception) {
                repository.markDelivered(delivery.id(), "failed", "Mail error: " + exception.getMessage());
            }
        } else {
            log.info("Reminder for {} (email): {}", delivery.userId(), text);
            repository.markDelivered(delivery.id(), "sent", "Logged (mail not configured).");
        }
    }
}
