package com.ukhanyiso.matching.api;

import java.util.List;

/** Bad learner input. The messages are fixed sentences that never repeat what the learner typed. */
public class InvalidMarksException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final transient List<String> errors;

    public InvalidMarksException(List<String> errors) {
        super("Invalid marks");
        this.errors = List.copyOf(errors);
    }

    public List<String> errors() {
        return errors;
    }
}
