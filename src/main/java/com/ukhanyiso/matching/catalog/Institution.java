package com.ukhanyiso.matching.catalog;

public record Institution(
        String institutionId,
        String name,
        String apsMethod,            // BEST6_EXCL_LO | ALL_EXCL_LO | CUSTOM
        boolean apsMethodVerified,   // false -> every result carries an "APS method not yet confirmed" caveat
        boolean excludeLevelOne,     // TUT does not count a subject at level 1 (official 2027 course info)
        String applyUrl) {
}
