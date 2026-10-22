package com.ukhanyiso;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Starts the app. It sits in com.ukhanyiso, the parent of com.ukhanyiso.matching, so Spring finds every
 * controller, service, repository and entity below it. Keep exactly ONE class with @SpringBootApplication.
 */
@SpringBootApplication
public class UkhanyisoApplication {

    public static void main(String[] args) {
        SpringApplication.run(UkhanyisoApplication.class, args);
    }
}
