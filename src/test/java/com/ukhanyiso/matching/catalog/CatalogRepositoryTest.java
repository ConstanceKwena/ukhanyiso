package com.ukhanyiso.matching.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

/** Checks that schema.sql and data.sql load into H2 and the repository reads them back correctly. */
@SpringBootTest
class CatalogRepositoryTest {

    @Autowired
    CatalogRepository repository;

    @Test
    void loadsTheTwelveCoursesFromTheDatabase() {
        Catalog catalog = repository.load();
        assertEquals(12, catalog.courses().size());
        assertEquals(3, catalog.institutions().size());
        assertEquals(51, catalog.courses().stream().mapToInt(c -> c.requirements().size()).sum());
        assertEquals(3, catalog.config().likelyApsMargin());
    }

    @Test
    void llbKeepsItsTwoApsOptions() {
        Course llb = repository.load().courses().stream().filter(c -> c.courseId().equals("UJ-LLB")).findFirst().orElseThrow();
        assertEquals(31, llb.minAps());
        assertTrue(llb.requirements().stream().anyMatch(r -> r.subjectId().equals("MATHS_LIT") && Integer.valueOf(32).equals(r.apsRequired())));
        assertEquals("partial", llb.sourceStatus());
    }

    @Test
    void tutExcludesLevelOneAndUjClosingTimeIsNotStored() {
        Catalog catalog = repository.load();
        assertTrue(catalog.institutions().get("TUT").excludeLevelOne());
        assertFalse(catalog.institutions().get("UJ").excludeLevelOne());
        assertNull(catalog.courses().stream().filter(c -> c.courseId().equals("UJ-BCOM-ACC")).findFirst().orElseThrow().closingTime());
    }
}
