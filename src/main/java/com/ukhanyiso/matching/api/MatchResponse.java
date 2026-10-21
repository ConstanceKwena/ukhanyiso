package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.CourseResult;

import java.util.List;

public record MatchResponse(List<CourseResult> results, String disclaimer) {
}
