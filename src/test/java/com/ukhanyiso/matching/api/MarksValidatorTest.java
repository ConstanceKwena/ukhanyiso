package com.ukhanyiso.matching.api;

import com.ukhanyiso.matching.ApsCalculator.SubjectMark;
import com.ukhanyiso.matching.api.MatchRequest.MarkEntry;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** Cases V-01 to V-12 from docs/test-cases-validation.md. */
class MarksValidatorTest {

    static MatchRequest req(Object... pairs) {
        List<MarkEntry> list = new ArrayList<>();
        for (int i = 0; i < pairs.length; i += 2) list.add(new MarkEntry((String) pairs[i], pairs[i + 1]));
        return new MatchRequest(list);
    }

    static List<String> errorsFor(MatchRequest r) {
        return assertThrows(InvalidMarksException.class, () -> MarksValidator.validate(r)).errors();
    }

    @Test void v01MarkAbove100() { assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", 101))); }
    @Test void v02NegativeMark() { assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", -1))); }
    @Test void v03DecimalMarkRejected() { assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", 70.5))); }
    @Test void v03bTextualDecimalRejected() { assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", "70.5"))); }
    @Test void v04DuplicateSubject() { assertTrue(errorsFor(req("Mathematics", 70, "Mathematics", 65)).contains(MarksValidator.DUPLICATE)); }
    @Test void v05UnknownSubject() { assertEquals(List.of(MarksValidator.UNKNOWN_SUBJECT), errorsFor(req("Wizardry", 70))); }
    @Test void v06EmptyMark() { assertEquals(List.of(MarksValidator.EMPTY), errorsFor(req("Mathematics", ""))); }
    @Test void v06bNullMark() { assertEquals(List.of(MarksValidator.EMPTY), errorsFor(req("Mathematics", null))); }
    @Test void v06cEmptySubject() { assertEquals(List.of(MarksValidator.EMPTY), errorsFor(req("", 70))); }

    @Test
    void v07ScriptTagIsRejectedAndNeverEchoed() {
        List<String> errors = errorsFor(req("<script>alert(1)</script>", 70));
        assertEquals(List.of(MarksValidator.UNKNOWN_SUBJECT), errors);
        assertFalse(String.join(" ", errors).contains("script"));
    }

    @Test
    void v07bSqlInjectionTextIsJustAnUnknownSubject() {
        assertEquals(List.of(MarksValidator.UNKNOWN_SUBJECT), errorsFor(req("'; DROP TABLE courses; --", 70)));
    }

    @Test
    void v08BoundariesAreAccepted() {
        List<SubjectMark> ok = MarksValidator.validate(req("Mathematics", 0, "Accounting", 100, "Life Orientation", "55"));
        assertEquals(3, ok.size());
        assertEquals("MATHS", ok.get(0).subjectId());
        assertFalse(ok.get(2).countsInAps());   // Life Orientation
    }

    @Test void v09MathsAndMathsLiteracy() { assertTrue(errorsFor(req("Mathematics", 70, "Mathematical Literacy", 65)).contains(MarksValidator.CONFLICT)); }
    @Test void v10CatAndIt() { assertTrue(errorsFor(req("Computer Applications Technology", 70, "Information Technology", 65)).contains(MarksValidator.CONFLICT)); }
    @Test void v11EnglishTwice() { assertTrue(errorsFor(req("English Home Language", 70, "English First Additional Language", 65)).contains(MarksValidator.LANG_ONCE)); }
    @Test void v12IsiZuluAndIsiXhosa() { assertTrue(errorsFor(req("isiZulu Home Language", 70, "isiXhosa First Additional Language", 65)).contains(MarksValidator.LANG_GROUP)); }
    @Test void v12bSothoFamily() { assertTrue(errorsFor(req("Sepedi Home Language", 70, "Setswana First Additional Language", 65)).contains(MarksValidator.LANG_GROUP)); }

    @Test void noMarksGiven() {
        assertEquals(List.of(MarksValidator.NONE_GIVEN), errorsFor(new MatchRequest(List.of())));
        assertEquals(List.of(MarksValidator.NONE_GIVEN), errorsFor(new MatchRequest(null)));
        assertEquals(List.of(MarksValidator.NONE_GIVEN), errorsFor(null));
    }

    @Test void tooManySubjects() {
        List<MarkEntry> many = new ArrayList<>();
        for (int i = 0; i < 13; i++) many.add(new MarkEntry("Mathematics", 50));
        assertEquals(List.of(MarksValidator.TOO_MANY), errorsFor(new MatchRequest(many)));
    }

    @Test void nullEntryInList() {
        List<MarkEntry> list = new ArrayList<>();
        list.add(null);
        assertEquals(List.of(MarksValidator.EMPTY), errorsFor(new MatchRequest(list)));
    }

    @Test void otherLanguagesBecomeAddLang() {
        List<SubjectMark> ok = MarksValidator.validate(req("English Home Language", 70, "Afrikaans First Additional Language", 60));
        assertEquals("ENG_HL", ok.get(0).subjectId());
        assertEquals("ADD_LANG", ok.get(1).subjectId());
    }

    @Test void hugeNumbersAndStrangeTypesAreRejected() {
        assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", 99999999999L)));
        assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", "7e1")));
        assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", List.of(70))));
        assertEquals(List.of(MarksValidator.RANGE), errorsFor(req("Mathematics", Double.NaN)));
    }
}
