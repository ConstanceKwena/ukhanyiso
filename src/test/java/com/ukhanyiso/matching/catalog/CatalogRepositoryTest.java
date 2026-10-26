package com.ukhanyiso.matching.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

/** Checks that schema.sql and data.sql load into H2 and the repository reads them back correctly. */
@SpringBootTest
class CatalogRepositoryTest {

    @Autowired
    CatalogRepository repository;

    @Autowired
    DataSource dataSource;

    @Test
    void loadsTheTwelveCoursesFromTheDatabase() {
        Catalog catalog = repository.load();
        assertEquals(17, catalog.courses().size(), "12 university/TUT courses + 5 SWGC TVET courses");
        assertEquals(4, catalog.institutions().size(), "UJ, UP, TUT, SWGC");
        assertEquals(70, catalog.courses().stream().mapToInt(c -> c.requirements().size()).sum(),
                "51 existing + 19 SWGC subject requirements");
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

    @Test
    void rerunningSeedDataPreservesApplicationsReferencingInstitutions() {
        var jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("CREATE TABLE seed_test_institution_applications ("
                + "application_id VARCHAR(40) PRIMARY KEY, "
                + "institution_id VARCHAR(20) NOT NULL REFERENCES institutions(institution_id))");
        try {
            jdbc.update("INSERT INTO seed_test_institution_applications VALUES (?, ?)",
                    "application-1", "UJ");

            new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(dataSource);

            assertEquals(1, jdbc.queryForObject(
                    "SELECT COUNT(*) FROM seed_test_institution_applications WHERE application_id = ?",
                    Integer.class, "application-1"));
            assertEquals(4, jdbc.queryForObject("SELECT COUNT(*) FROM institutions", Integer.class));
        } finally {
            jdbc.execute("DROP TABLE seed_test_institution_applications");
        }
    }
}
