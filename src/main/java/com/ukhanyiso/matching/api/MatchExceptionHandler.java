package com.ukhanyiso.matching.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Turns matching and saved-mark failures into short, safe JSON. Never returns stack traces or user input.
 */
@RestControllerAdvice(assignableTypes = {MatchController.class, LearnerMarksController.class})
public class MatchExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(MatchExceptionHandler.class);

    @ExceptionHandler(InvalidMarksException.class)
    public ResponseEntity<Map<String, List<String>>> invalidMarks(InvalidMarksException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", e.errors()));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, TypeMismatchException.class})
    public ResponseEntity<Map<String, List<String>>> unreadable(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("errors", List.of("We could not read that request. Please check your marks and try again.")));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, List<String>>> requestStatus(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("errors", List.of("Authentication is required.")));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, List<String>>> other(Exception e) {
        log.error("Unexpected error in marks request: {}", e.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("errors", List.of("Something went wrong. Please try again.")));
    }
}
