package com.ukhanyiso.bursary;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class BursaryDataTest {
    private final List<Bursary> all = new BursaryRepository(new ObjectMapper().findAndRegisterModules()).findAll();

    @Test void loadsFiveBursaries() { assertThat(all).hasSize(5); }

    @Test void idsAreUnique() {
        Set<String> ids = new HashSet<>();
        all.forEach(b -> assertThat(ids.add(b.id())).as("duplicate id " + b.id()).isTrue());
    }

    @Test void everyBursaryHasANameADateAndAtLeastOneDocumentLine() {
        all.forEach(b -> {
            assertThat(b.name()).isNotBlank();
            assertThat(b.closingDate()).as(b.id() + " closing date").isNotNull();
            assertThat(b.documents()).as(b.id() + " documents").isNotEmpty();
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
