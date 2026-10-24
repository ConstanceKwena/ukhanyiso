
package com.ukhanyiso.bursary;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class BursaryService {

    static final String DISCLAIMER =
            "Bursary details may change. Always confirm the closing date "
                    + "and required documents on the official page before applying.";

    static final int CLOSING_SOON_DAYS = 14;
    static final ZoneId SOUTH_AFRICA =
            ZoneId.of("Africa/Johannesburg");

    private final BursaryRepository repository;
    private final Clock clock;

    public BursaryService(BursaryRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public BursaryResponse list() {
        LocalDateTime now =
                LocalDateTime.now(clock.withZone(SOUTH_AFRICA));

        List<BursaryResponse.Item> items = repository.findAll()
                .stream()
                .map(b -> new BursaryResponse.Item(
                        b.id(),
                        b.name(),
                        b.type(),
                        b.closingDate(),
                        b.closingTime(),
                        deadline(b, now),
                        b.whoItsFor(),
                        b.documents(),
                        b.officialLink(),
                        b.status(),
                        b.notes(),
                        b.lastChecked()
                ))
                .toList();

        return new BursaryResponse(items, DISCLAIMER);
    }

    static String deadline(Bursary b, LocalDateTime now) {
        if (b.closingDate() == null) {
            return "UNKNOWN";
        }

        LocalTime time = b.closingTime() == null
                ? LocalTime.MAX
                : b.closingTime();

        LocalDateTime closes = b.closingDate().atTime(time);

        if (now.isAfter(closes)) {
            return "CLOSED";
        }

        if (!now.toLocalDate().isBefore(
                b.closingDate().minusDays(CLOSING_SOON_DAYS))) {
            return "CLOSING_SOON";
        }

        return "OPEN";
    }
}