package com.ukhanyiso.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable and customize HTTP Security Headers
            .headers(headers -> headers
                // 1. Strict-Transport-Security (HSTS)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000) // 1 year
                )
                // 2. X-Frame-Options (Prevent Clickjacking)
                .frameOptions(frame -> frame.deny())
                
                // 3. X-Content-Type-Options (Prevent MIME sniffing)
                .contentTypeOptions(contentType -> {})
                
                // 4. Referrer-Policy
                .referrerPolicy(referrer -> referrer
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                
                // 5. Content Security Policy (CSP)
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;")
                )
            )
            // CSRF protection configuration for API endpoints
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
