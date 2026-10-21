package com.ukhanyiso.matching.catalog;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SubjectCatalogTest {

    @Test void sameSubjectCountAsTheFrontEndList() { assertEquals(95, SubjectCatalog.ALL_NAMES.size()); }

    @Test void requirementSubjectsMapToTheirIds() {
        assertEquals("MATHS", SubjectCatalog.idFor("Mathematics"));
        assertEquals("MATHS_LIT", SubjectCatalog.idFor("Mathematical Literacy"));
        assertEquals("TECH_MATHS", SubjectCatalog.idFor("Technical Mathematics"));
        assertEquals("PHYS_SCI", SubjectCatalog.idFor("Physical Sciences"));
        assertEquals("ENG_HL", SubjectCatalog.idFor("English Home Language"));
        assertEquals("ENG_FAL", SubjectCatalog.idFor("English First Additional Language"));
        assertEquals("LO", SubjectCatalog.idFor("Life Orientation"));
    }

    @Test void otherLanguagesBecomeAddLangButEnglishSecondLanguageDoesNot() {
        assertEquals("ADD_LANG", SubjectCatalog.idFor("isiZulu Home Language"));
        assertEquals("ADD_LANG", SubjectCatalog.idFor("French Second Additional Language"));
        assertEquals("ENG_SAL", SubjectCatalog.idFor("English Second Additional Language"));
    }

    @Test void everyNameMapsToSomeIdAndOnlyLifeOrientationSkipsAps() {
        for (String n : SubjectCatalog.ALL_NAMES) {
            assertFalse(SubjectCatalog.idFor(n).isBlank(), n);
            assertEquals(!n.equals("Life Orientation"), SubjectCatalog.countsInAps(n), n);
        }
    }

    @Test void languageOfStripsTheLevel() {
        assertEquals("isiZulu", SubjectCatalog.languageOf("isiZulu Home Language"));
        assertEquals("South African Sign Language", SubjectCatalog.languageOf("South African Sign Language Home Language"));
    }
}
