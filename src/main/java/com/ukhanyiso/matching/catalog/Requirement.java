package com.ukhanyiso.matching.catalog;

/**
 * One accepted subject. Same groupId = "any one of these" (OR); different groups = AND.
 * apsRequired replaces the course APS when this is the alternative the learner satisfies
 * (UJ LLB: 31 with Maths, 32 with Maths Literacy). minPercent is used only where a % is published instead of a level.
 */
public record Requirement(
        long reqId,
        int groupId,
        String subjectId,
        int minLevel,
        Integer apsRequired,
        Integer minPercent) {
}
