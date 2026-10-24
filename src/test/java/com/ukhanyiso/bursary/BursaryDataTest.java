package com.ukhanyiso.bursary;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class BursaryDataTest {
    private final List<Bursary> all = new BursaryRepository(new ObjectMapper().findAndRegisterModules()).findAll();

    @Test void loadsElevenBursaries() { assertThat(all).hasSize(11); }

    @Test void idsAreUnique() {
        Set<String> ids = new HashSet<>();
        all.forEach(b -> assertThat(ids.add(b.id())).as("duplicate id " + b.id()).isTrue());
    }

    @Test void everyBursaryHasANameAndAtLeastOneDocumentLine() {
        all.forEach(b -> {
            assertThat(b.name()).isNotBlank();
            assertThat(b.documents()).as(b.id() + " documents").isNotEmpty();
        });
    }

    @Test void aMissingClosingDateIsNeverMarkedVerified() {
        all.forEach(b -> { if (b.closingDate() == null) assertThat(b.status()).as(b.id() + " status").isNotEqualTo("verified"); });
    }

    @Test void postgraduateBursariesSayPostgraduateOnlyAndAreNotYetVerified() {
        all.stream().filter(b -> b.id().compareTo("B006") >= 0).forEach(b -> {
            assertThat(b.whoItsFor()).as(b.id() + " who it's for").startsWith("Postgraduate only");
            assertThat(b.status()).as(b.id() + " status").isEqualTo("unverified");
        });
    }

    @Test void linksAreEmptyOrHttpsOnly() {
        all.forEach(b -> { if (b.officialLink() != null) assertThat(b.officialLink()).as(b.id() + " link").startsWith("https://"); });
    }

    @Test void statusUsesTheSameWordsAsTheSourceSheet() {
        Set<String> allowed = Set.of("verified", "partial", "unverified", "conflicting", "stale");
        all.forEach(b -> assertThat(allowed).as(b.id() + " status").contains(b.status()));
    }
}
