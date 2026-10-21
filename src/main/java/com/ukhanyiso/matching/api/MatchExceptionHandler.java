package com.ukhanyiso.matching.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

/**
 * Turns failures on /api/match into short, safe JSON. Limited to MatchController so the older
 * /api/matching/process endpoint keeps its current behaviour. Never returns stack traces, class names or user input.
 */
@RestControllerAdvice(assignableTypes = MatchController.class)
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, List<String>>> other(Exception e) {
        log.error("Unexpected error on /api/match: {}", e.getClass().getSimpleName()); // class only: no marks, no stack trace
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("errors", List.of("Something went wrong. Please try again.")));
    }
}
