package com.ukhanyiso.bursary;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class BursaryServiceTest {
    private static Bursary closing(LocalDate date, LocalTime time) {
        return new Bursary("X", "Test", "Test", date, time, "w", List.of(), null, "unverified", null);
    }

    @Test void noClosingDateIsUnknownNeverOpen() {
        assertThat(BursaryService.deadline(closing(null, null), LocalDateTime.of(2026, 10, 21, 9, 0))).isEqualTo("UNKNOWN");
    }

    @Test void closingTimeIsRespected() {
        Bursary astron = closing(LocalDate.of(2026, 10, 26), LocalTime.of(12, 0));
        assertThat(BursaryService.deadline(astron, LocalDateTime.of(2026, 10, 26, 11, 59))).isEqualTo("CLOSING_SOON");
        assertThat(BursaryService.deadline(astron, LocalDateTime.of(2026, 10, 26, 12, 1))).isEqualTo("CLOSED");
    }

    @Test void withoutATimeTheBursaryStaysOpenUntilTheEndOfThatDay() {
        Bursary nsfas = closing(LocalDate.of(2026, 10, 31), null);
        assertThat(BursaryService.deadline(nsfas, LocalDateTime.of(2026, 10, 31, 23, 0))).isEqualTo("CLOSING_SOON");
        assertThat(BursaryService.deadline(nsfas, LocalDateTime.of(2026, 11, 1, 0, 0))).isEqualTo("CLOSED");
    }

    @Test void closingSoonMeansWithinFourteenDays() {
        Bursary b = closing(LocalDate.of(2026, 10, 31), null);
        assertThat(BursaryService.deadline(b, LocalDateTime.of(2026, 10, 17, 12, 0))).isEqualTo("CLOSING_SOON");
        assertThat(BursaryService.deadline(b, LocalDateTime.of(2026, 10, 16, 12, 0))).isEqualTo("OPEN");
    }
}
