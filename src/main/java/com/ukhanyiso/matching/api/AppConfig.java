package com.ukhanyiso.matching.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class AppConfig {

    /** Closing times are South African time, whatever zone the server runs in. Tests can supply their own Clock. */
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Africa/Johannesburg"));
    }
}
