package com.ukhanyiso.matching.catalog;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * The matric subjects a learner can pick, and how each one maps to the ids used in the course data.
 * ALL_NAMES is a copy of SUBJECTS in static/js/validate.js. If you add a subject there, add it here too
 * (SubjectCatalogTest fails if the two lists differ in size from the agreed count).
 */
public final class SubjectCatalog {
    private SubjectCatalog() {
    }

    public static final List<String> ALL_NAMES = List.of(
            "Afrikaans Home Language",
            "English Home Language",
            "isiNdebele Home Language",
            "isiXhosa Home Language",
            "isiZulu Home Language",
            "Sepedi Home Language",
            "Sesotho Home Language",
            "Setswana Home Language",
            "siSwati Home Language",
            "Tshivenda Home Language",
            "Xitsonga Home Language",
            "Afrikaans First Additional Language",
            "English First Additional Language",
            "isiNdebele First Additional Language",
            "isiXhosa First Additional Language",
            "isiZulu First Additional Language",
            "Sepedi First Additional Language",
            "Sesotho First Additional Language",
            "Setswana First Additional Language",
            "siSwati First Additional Language",
            "Tshivenda First Additional Language",
            "Xitsonga First Additional Language",
            "Afrikaans Second Additional Language",
            "English Second Additional Language",
            "isiNdebele Second Additional Language",
            "isiXhosa Second Additional Language",
            "isiZulu Second Additional Language",
            "Sepedi Second Additional Language",
            "Sesotho Second Additional Language",
            "Setswana Second Additional Language",
            "siSwati Second Additional Language",
            "Tshivenda Second Additional Language",
            "Xitsonga Second Additional Language",
            "Arabic Second Additional Language",
            "French Second Additional Language",
            "German Home Language",
            "German Second Additional Language",
            "Gujarati Home Language",
            "Gujarati First Additional Language",
            "Gujarati Second Additional Language",
            "Hebrew Second Additional Language",
            "Hindi Home Language",
            "Hindi First Additional Language",
            "Hindi Second Additional Language",
            "Italian Second Additional Language",
            "Latin Second Additional Language",
            "Portuguese Home Language",
            "Portuguese First Additional Language",
            "Portuguese Second Additional Language",
            "Spanish Second Additional Language",
            "Tamil Home Language",
            "Tamil First Additional Language",
            "Tamil Second Additional Language",
            "Telegu Home Language",
            "Telegu First Additional Language",
            "Telegu Second Additional Language",
            "Urdu Home Language",
            "Urdu First Additional Language",
            "Urdu Second Additional Language",
            "Modern Greek Second Additional Language",
            "South African Sign Language Home Language",
            "Mathematics",
            "Mathematical Literacy",
            "Technical Mathematics",
            "Physical Sciences",
            "Technical Sciences",
            "Life Sciences",
            "Agricultural Sciences",
            "Agricultural Technology",
            "Agricultural Management Practices",
            "Geography",
            "History",
            "Religion Studies",
            "Accounting",
            "Business Studies",
            "Economics",
            "Information Technology",
            "Computer Applications Technology",
            "Engineering Graphics and Design",
            "Civil Technology",
            "Electrical Technology",
            "Mechanical Technology",
            "Consumer Studies",
            "Hospitality Studies",
            "Tourism",
            "Dramatic Arts",
            "Visual Arts",
            "Music",
            "Dance Studies",
            "Design",
            "Equine Studies",
            "Maritime Economics",
            "Nautical Science",
            "Sport and Exercise Science",
            "Life Orientation");

    private static final Set<String> NAME_SET = Set.copyOf(ALL_NAMES);

    /** Subjects whose id is used in course requirements (subjects table). Others get a slug id. */
    private static final Map<String, String> KNOWN_IDS = Map.ofEntries(
            Map.entry("Mathematics", "MATHS"),
            Map.entry("Mathematical Literacy", "MATHS_LIT"),
            Map.entry("Technical Mathematics", "TECH_MATHS"),
            Map.entry("Physical Sciences", "PHYS_SCI"),
            Map.entry("Technical Sciences", "TECH_SCI"),
            Map.entry("English Home Language", "ENG_HL"),
            Map.entry("English First Additional Language", "ENG_FAL"),
            Map.entry("English Second Additional Language", "ENG_SAL"),
            Map.entry("Life Orientation", "LO"));

    /** Pairs that can't be taken together (same as CONFLICTS in validate.js). */
    public static final List<Set<String>> CONFLICTS = List.of(
            Set.of("Mathematics", "Mathematical Literacy"),
            Set.of("Computer Applications Technology", "Information Technology"),
            Set.of("Consumer Studies", "Hospitality Studies"));

    /** Language families where only one can be taken (same as LANG_GROUPS in validate.js). */
    public static final List<Set<String>> LANG_GROUPS = List.of(
            Set.of("isiXhosa", "isiZulu", "siSwati", "isiNdebele"),
            Set.of("Sepedi", "Sesotho", "Setswana"));

    private static final Pattern LANGUAGE_LEVEL = Pattern.compile(" (Home|First Additional|Second Additional) Language$");

    public static boolean isKnown(String name) {
        return name != null && NAME_SET.contains(name);
    }

    public static boolean isLanguage(String name) {
        return name != null && name.endsWith(" Language");
    }

    /** "isiZulu Home Language" -> "isiZulu". */
    public static String languageOf(String name) {
        return LANGUAGE_LEVEL.matcher(name).replaceFirst("");
    }

    /** Life Orientation never counts towards APS. */
    public static boolean countsInAps(String name) {
        return !"Life Orientation".equals(name);
    }

    /**
     * Id used by the matcher. Every language other than English becomes ADD_LANG, because courses such as the
     * UJ LLB ask for "an additional language" without naming one.
     */
    public static String idFor(String name) {
        String known = KNOWN_IDS.get(name);
        if (known != null) return known;
        if (isLanguage(name)) return "ADD_LANG";
        return name.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_");
    }
}
